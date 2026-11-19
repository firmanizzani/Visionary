export type ModelAsset = {name:string;baseUrl:string;bytes:number;sha256:string;parts:{file:string;bytes:number;sha256:string}[]};
export async function sha256(bytes:ArrayBuffer):Promise<string>{return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),v=>v.toString(16).padStart(2,'0')).join('');}
export async function loadAsset(asset:ModelAsset,status:(s:string)=>void,override?:string):Promise<ArrayBuffer>{
 let cache:Cache|null=null;try{cache=await caches.open('visionary-models-v2');}catch{/* Browser storage is optional. */}
 const parts=override?[{file:override,bytes:asset.bytes,sha256:asset.sha256}]:asset.parts;
 const output=new Uint8Array(asset.bytes);let offset=0;
 for(let i=0;i<parts.length;i++){
  const part=parts[i];const url=new URL(part.file,override?self.location.origin:new URL(asset.baseUrl,self.location.origin));
  const key=new URL(url);key.searchParams.set('sha256',part.sha256);
  const cached=await cache?.match(key.href);let buffer=cached?await cached.arrayBuffer():null;
  if(buffer&&(buffer.byteLength!==part.bytes||await sha256(buffer)!==part.sha256)){await cache?.delete(key.href);buffer=null;}
  if(!buffer){
   status(`Loading ${asset.name} · file ${i+1}/${parts.length} · ${Math.round(offset/asset.bytes*100)}%`);
   const response=await fetch(key.href,{signal:AbortSignal.timeout(120000)});
   if(!response.ok)throw new Error(`${asset.name} could not be downloaded (${response.status}). Retry after checking the connection.`);
   const reader=response.body?.getReader();const chunks:Uint8Array[]=[];let loaded=0;
   if(reader){while(true){const {value,done}=await reader.read();if(done)break;loaded+=value.byteLength;if(loaded>part.bytes)throw new Error('Model file size does not match its manifest.');chunks.push(value);status(`Loading ${asset.name} · ${Math.min(100,Math.round((offset+loaded)/asset.bytes*100))}%`);}
    const bytes=new Uint8Array(loaded);let start=0;for(const chunk of chunks){bytes.set(chunk,start);start+=chunk.byteLength;}buffer=bytes.buffer;
   }else buffer=await response.arrayBuffer();
   if(buffer.byteLength!==part.bytes||await sha256(buffer)!==part.sha256)throw new Error('Model integrity check failed. Deploy the model files and application from the same version.');
   await cache?.put(key.href,new Response(buffer,{headers:{'Content-Type':'application/octet-stream'}})).catch(()=>{});
  }
  output.set(new Uint8Array(buffer),offset);offset+=buffer.byteLength;
 }
 if(offset!==asset.bytes||await sha256(output.buffer)!==asset.sha256)throw new Error('The complete model failed its integrity check.');
 return output.buffer;
}
