import * as ort from 'onnxruntime-web/webgpu';
import { decode, iou, letterbox } from './math';
import { loadAsset, sha256 } from './assets';
import { MODEL, VERIFIER } from './model';
import {consolidateRegions,establishedClasses} from './regions';
import type { DetectedObject } from '@lib/types';

let session:ort.InferenceSession|null=null,verifier:ort.InferenceSession|null=null;
let embeddings:Float32Array,loading:Promise<void>|null=null,provider='wasm';
const status=(message:string)=>postMessage({type:'status',message});
// These well-trained geometry classes should not be renamed from a crop whose clothing or
// background dominates CLIP. Ambiguous everyday goods still require independent matching.

async function init(override?:string){
 ort.env.wasm.numThreads=1;
 ort.env.wasm.wasmPaths='https://cdn.jsdelivr.net/npm/onnxruntime-web@1.23.2/dist/';
 if(MODEL.labels.length!==VERIFIER.labels.length||MODEL.labels.some((name,i)=>name!==VERIFIER.labels[i]))throw new Error('Detector and label verifier vocabularies differ. Deploy matching model manifests.');
 const bytes=await loadAsset(MODEL,status,override);
 status('Initializing broad-vocabulary detection…');
 if('gpu' in navigator)try{session=await ort.InferenceSession.create(bytes,{executionProviders:['webgpu']});provider='webgpu';}catch{session=null;}
 if(!session)session=await ort.InferenceSession.create(bytes,{executionProviders:['wasm']});
 const verificationBytes=await loadAsset(VERIFIER,status);
 status('Initializing local label verification…');
 try{verifier=await ort.InferenceSession.create(verificationBytes,{executionProviders:[provider]});}
 catch{verifier=await ort.InferenceSession.create(verificationBytes,{executionProviders:['wasm']});}
 const textUrl=new URL(VERIFIER.baseUrl+VERIFIER.textFile,self.location.origin);textUrl.searchParams.set('sha256',VERIFIER.textSha256);
 const text=await fetch(textUrl,{signal:AbortSignal.timeout(30000)});
 if(!text.ok)throw new Error('Label vocabulary could not be loaded. Retry the model download.');
 const data=await text.arrayBuffer();
 if(await sha256(data)!==VERIFIER.textSha256||data.byteLength!==MODEL.labels.length*VERIFIER.embeddingSize*4)throw new Error('Label embedding integrity check failed.');
 embeddings=new Float32Array(data);postMessage({type:'ready',provider});
}

function tensorFromCanvas(canvas:OffscreenCanvas):ort.Tensor{
 const {width,height}=canvas,pixels=canvas.getContext('2d',{willReadFrequently:true})!.getImageData(0,0,width,height).data;
 const length=width*height,input=new Float32Array(length*3);
 for(let i=0;i<length;i++){input[i]=pixels[i*4]/255;input[length+i]=pixels[i*4+1]/255;input[2*length+i]=pixels[i*4+2]/255;}
 return new ort.Tensor('float32',input,[1,3,height,width]);
}

function classify(features:Float32Array){
 let best=-Infinity,runnerUp=-Infinity,classId=-1;
 for(let c=0;c<MODEL.labels.length;c++){
  let cosine=0;const offset=c*VERIFIER.embeddingSize;
  for(let k=0;k<VERIFIER.embeddingSize;k++)cosine+=features[k]*embeddings[offset+k];
  if(cosine>best){runnerUp=best;best=cosine;classId=c;}else if(cosine>runnerUp)runnerUp=cosine;
 }
 return {best,margin:Math.max(0,best-runnerUp),classId};
}
function relatedLabels(a:number,b:number){
 let cosine=0;for(let k=0;k<VERIFIER.embeddingSize;k++)cosine+=embeddings[a*VERIFIER.embeddingSize+k]*embeddings[b*VERIFIER.embeddingSize+k];
 return cosine>=.95;
}
async function embed(canvas:OffscreenCanvas):Promise<Float32Array>{
 const tensor=tensorFromCanvas(canvas),outputs=await verifier!.run({[verifier!.inputNames[0]]:tensor});
 try{return new Float32Array(outputs[verifier!.outputNames[0]].data as Float32Array);}
 finally{tensor.dispose();Object.values(outputs).forEach(t=>t.dispose());}
}
async function verifyLabel(bitmap:ImageBitmap,object:DetectedObject,context:ReturnType<typeof classify>|null):Promise<DetectedObject|null>{
 const [x1,y1,x2,y2]=object.bounding_box,size=VERIFIER.inputSize;
 // Letterbox only this region. Expanding the crop can accidentally classify a nearby object twice.
 const w=x2-x1,h=y2-y1,scale=Math.min(size/w,size/h),dw=w*scale,dh=h*scale;
 const canvas=new OffscreenCanvas(size,size),ctx=canvas.getContext('2d',{willReadFrequently:true})!;
 ctx.fillStyle='white';ctx.fillRect(0,0,size,size);
 ctx.drawImage(bitmap,x1,y1,w,h,(size-dw)/2,(size-dh)/2,dw,dh);
 let match=classify(await embed(canvas));
 // Context may disambiguate the leading region (e.g. a lamp head vs. a microphone),
 // but must never overwrite every secondary box with the scene's dominant object.
 const corroborated=MODEL.labels[match.classId]===object.object_name;
 if(context&&!corroborated&&context.best>match.best)match=context;
 if(match.best<.22||match.classId<0)return null;
 // Weak region scores must not force every secondary object out of a crowded scene.
 // For close label alternatives, require stability under a small change in the SAME crop,
 // rather than borrowing the entire scene's dominant label for unrelated objects.
 if(!context&&!corroborated){
  if(match.best<.24)return null;
  if(match.margin<.015){
   if(match.best<.25)return null;
   const px=w*.1,py=h*.1,left=Math.max(0,x1-px),top=Math.max(0,y1-py),right=Math.min(bitmap.width,x2+px),bottom=Math.min(bitmap.height,y2+py);
   const expanded=new OffscreenCanvas(size,size),ec=expanded.getContext('2d')!,sw=right-left,sh=bottom-top,s=Math.min(size/sw,size/sh);
   ec.fillStyle='white';ec.fillRect(0,0,size,size);ec.drawImage(bitmap,left,top,sw,sh,(size-sw*s)/2,(size-sh*s)/2,sw*s,sh*s);
   const nearby=classify(await embed(expanded));
   if(nearby.best<.24||(nearby.classId!==match.classId&&!relatedLabels(nearby.classId,match.classId)))return null;
  }
 }
 return {...object,class_id:match.classId,object_name:MODEL.labels[match.classId],label_similarity:match.best,label_margin:match.margin};
}

self.onmessage=async({data})=>{
 try{
  if(data.type==='init'){loading??=init(data.url||undefined).catch(e=>{loading=null;throw e;});await loading;return;}
  if(data.type!=='infer'||!session||!verifier)return;
  const bitmap:ImageBitmap=data.bitmap,{width,height}=bitmap;
  try{
   const start=performance.now(),size=MODEL.inputSize,c=new OffscreenCanvas(size,size),ctx=c.getContext('2d',{willReadFrequently:true})!;
   const {padX,padY,resizedWidth,resizedHeight}=letterbox(width,height,size);
   ctx.fillStyle='rgb(114,114,114)';ctx.fillRect(0,0,size,size);ctx.drawImage(bitmap,padX,padY,resizedWidth,resizedHeight);
   const tensor=tensorFromCanvas(c);let outputs:Record<string,ort.Tensor>={};let objects:DetectedObject[];
   try{
    outputs=await session.run({[session.inputNames[0]]:tensor});const values=Object.values(outputs),pred=values.find(v=>v.dims.length===3),proto=values.find(v=>v.dims.length===4);
    if(!pred||!proto)throw new Error('Segmentation outputs are missing from this model.');
    objects=decode(pred.data as Float32Array,pred.dims,proto.data as Float32Array,proto.dims,width,height,.1,MODEL,20);
   }finally{tensor.dispose();Object.values(outputs).forEach(t=>t.dispose());}
   const verified:{object:DetectedObject;geometryMatch:boolean}[]=[];
   const scene=new OffscreenCanvas(VERIFIER.inputSize,VERIFIER.inputSize),sc=scene.getContext('2d')!;
   const side=Math.min(width,height);sc.drawImage(bitmap,(width-side)/2,(height-side)/2,side,side,0,0,VERIFIER.inputSize,VERIFIER.inputSize);
   const context=classify(await embed(scene));
   // Global context is safe only for a single cluster. A separate item elsewhere in
   // the scene must get its own label, even if the leading proposal is a small part.
   const leading=objects[0];
   const multipleRegions=leading&&objects.some(o=>o.confidence>=.4&&iou(o.bounding_box,leading.bounding_box)<.05);
   // The detector proposes geometry. Independent crop embeddings determine the label.
   for(const [index,object] of objects.slice(0,20).entries()){
    if(establishedClasses.has(object.object_name)&&object.confidence>=.65){verified.push({object,geometryMatch:true});continue;}
    const result=await verifyLabel(bitmap,object,index===0&&!multipleRegions?context:null);if(!result)continue;
    const geometryMatch=object.class_id===result.class_id||relatedLabels(object.class_id,result.class_id)||result.object_name.split(' ').includes(object.object_name);
    verified.push({object:result,geometryMatch});
   }
   postMessage({type:'result',objects:consolidateRegions(verified,relatedLabels),latency:performance.now()-start,id:data.id});
  }finally{bitmap.close();}
 }catch(error){postMessage({type:'error',message:error instanceof Error?error.message:String(error),id:data.id});}
};
