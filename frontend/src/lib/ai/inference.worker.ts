import * as ort from 'onnxruntime-web/webgpu';
import { decode, letterbox } from './math';
let session: ort.InferenceSession | null=null;
let provider='wasm';
let loading: Promise<void> | null=null;
async function init(url: string) {
 ort.env.wasm.numThreads=1;
 ort.env.wasm.wasmPaths='https://cdn.jsdelivr.net/npm/onnxruntime-web@1.23.2/dist/';
 postMessage({type:'status',message:'Downloading segmentation model…'});
 let bytes: ArrayBuffer;
 let cache: Cache | null=null;
 try{cache=await caches.open('visionary-model-v1');}catch{/* private browser storage may be unavailable */}
 const cached=await cache?.match(url);
 if(cached) bytes=await cached.arrayBuffer(); else {
  const response=await fetch(url,{signal:AbortSignal.timeout(90000)});
  if(!response.ok) throw new Error('Model is unavailable. Run the ML export script and place the ONNX file in static/models.');
  const length=Number(response.headers.get('Content-Length'));
  if(response.body){ const reader=response.body.getReader();const chunks:Uint8Array[]=[];let loaded=0;
   while(true){const {done,value}=await reader.read();if(done)break;chunks.push(value);loaded+=value.length;postMessage({type:'status',message:`Downloading model · ${length?Math.round(loaded/length*100)+'%':(loaded/1048576).toFixed(1)+' MB'}`});}
   const full=new Uint8Array(loaded);let offset=0;for(const chunk of chunks){full.set(chunk,offset);offset+=chunk.length;}bytes=full.buffer;
  } else bytes=await response.arrayBuffer();
  await cache?.put(url,new Response(bytes,{headers:{'Content-Type':'application/octet-stream'}})).catch(()=>{});
 }
 postMessage({type:'status',message:'Initializing inference runtime…'});
 if('gpu' in navigator) try {session=await ort.InferenceSession.create(bytes,{executionProviders:['webgpu']});provider='webgpu';}catch{session=null;}
 if(!session) session=await ort.InferenceSession.create(bytes,{executionProviders:['wasm']});
 postMessage({type:'ready',provider});
}
self.onmessage=async ({data})=>{
 try {
  if(data.type==='init') { loading??=init(data.url).catch(e=>{loading=null;throw e;});await loading;return; }
  if(data.type!=='infer'||!session)return;
  const bitmap:ImageBitmap=data.bitmap, {width,height}=bitmap;
  try {
   const start=performance.now();const c=new OffscreenCanvas(640,640);const ctx=c.getContext('2d',{willReadFrequently:true})!;
   const {padX,padY,resizedWidth,resizedHeight}=letterbox(width,height);
   ctx.fillStyle='rgb(114,114,114)';ctx.fillRect(0,0,640,640);ctx.drawImage(bitmap,padX,padY,resizedWidth,resizedHeight);
   const pixels=ctx.getImageData(0,0,640,640).data, input=new Float32Array(3*640*640);
   for(let i=0;i<640*640;i++){input[i]=pixels[i*4]/255;input[640*640+i]=pixels[i*4+1]/255;input[2*640*640+i]=pixels[i*4+2]/255;}
   const tensor=new ort.Tensor('float32',input,[1,3,640,640]);
   const output=await session.run({[session.inputNames[0]]:tensor});
   try { const values=Object.values(output); const pred=values.find(v=>v.dims.length===3), proto=values.find(v=>v.dims.length===4);
    if(!pred||!proto)throw new Error('Segmentation output missing. Check the model export.');
    const objects=decode(pred.data as Float32Array,pred.dims,proto.data as Float32Array,proto.dims,width,height);
    postMessage({type:'result',objects,latency:performance.now()-start,id:data.id});
   }finally{tensor.dispose();Object.values(output).forEach(t=>t.dispose());}
  } finally{bitmap.close();}
 }catch(error){postMessage({type:'error',message:error instanceof Error?error.message:String(error),id:data.id});}
};
