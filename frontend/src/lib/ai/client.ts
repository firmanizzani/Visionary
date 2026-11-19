import { env } from '@lib/env';
import type { DetectedObject } from '@lib/types';
type Result={objects:DetectedObject[];latency:number};
let worker:Worker | null=null, ready:Promise<void> | null=null, busy=false, seq=0;
const pending=new Map<number,{resolve:(r:Result)=>void;reject:(e:Error)=>void}>();
export async function initialize(status:(s:string)=>void):Promise<void> {
 if(ready)return ready;
 ready=new Promise((resolve,reject)=>{
  worker=new Worker(new URL('./inference.worker.ts',import.meta.url),{type:'module'});
  worker.onmessage=({data})=>{
   if(data.type==='status')status(data.message);
   if(data.type==='ready'){status(`Model ready · ${data.provider.toUpperCase()}`);resolve();}
   if(data.type==='result'||data.type==='error'){
    const p=pending.get(data.id);if(p){pending.delete(data.id);busy=false;data.type==='error'?p.reject(new Error(data.message)):p.resolve(data);}
    else if(data.type==='error'){worker?.terminate();worker=null;ready=null;reject(new Error(data.message));}
   }
  };
  worker.onerror=()=>{const e=new Error('Inference worker failed. Try a current browser with WebAssembly support.');pending.forEach(p=>p.reject(e));pending.clear();busy=false;worker?.terminate();worker=null;ready=null;reject(e);};
  worker.postMessage({type:'init',url:new URL(env.PUBLIC_MODEL_URL||'/models/yolov8n-seg.onnx',location.origin).href});
 });
 return ready;
}
export function infer(bitmap:ImageBitmap):Promise<Result>{
 if(busy||!worker){bitmap.close();return Promise.reject(new Error('Inference is busy or the model is not ready.'));}
 busy=true; const id=++seq;
 return new Promise((resolve,reject)=>{pending.set(id,{resolve,reject});worker!.postMessage({type:'infer',bitmap,id},[bitmap]);});
}
