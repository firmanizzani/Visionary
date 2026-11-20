const MAX_BODY=2_000_000;
const HOP_HEADERS=['connection','keep-alive','proxy-authenticate','proxy-authorization','te','trailer','transfer-encoding','upgrade','content-length','content-encoding'];
const failure=(status:number,detail:string)=>Response.json({detail},{status,headers:{'Cache-Control':'no-store'}});

export async function forwardApi(request:Request,options:{origin:string;allowLocalHttp?:boolean;fetcher:typeof fetch;timeoutMs?:number}):Promise<Response>{
 let origin:URL;
 try{
  origin=new URL(options.origin);
  const local=options.allowLocalHttp&&origin.protocol==='http:'&&['127.0.0.1','localhost'].includes(origin.hostname);
  if((origin.protocol!=='https:'&&!local)||origin.username||origin.password||origin.search||origin.hash||origin.pathname!=='/'||origin.origin===new URL(request.url).origin)throw new Error();
 }catch{return failure(503,'The API service is not configured. Set BACKEND_ORIGIN to the backend HTTPS origin.');}
 const incoming=new URL(request.url);
 if(!incoming.pathname.startsWith('/api/v1/'))return failure(404,'API route not found.');
 let body:ArrayBuffer|undefined;
 if(request.method!=='GET'&&request.method!=='HEAD'&&request.body){
  const reader=request.body.getReader(),chunks:Uint8Array[]=[];let size=0;
  while(true){const chunk=await reader.read();if(chunk.done)break;size+=chunk.value.byteLength;if(size>MAX_BODY){await reader.cancel();return failure(413,'Request is too large.');}chunks.push(chunk.value);}
  const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength;}body=bytes.buffer;
 }
 const headers=new Headers();
 for(const key of ['accept','content-type','cookie','x-csrf-token','origin','referer','authorization']){const value=request.headers.get(key);if(value)headers.set(key,value);}
 try{
  const response=await options.fetcher(new URL(incoming.pathname+incoming.search,origin),{method:request.method,headers,body,redirect:'manual',signal:AbortSignal.any([request.signal,AbortSignal.timeout(options.timeoutMs??55000)])});
  const outgoing=new Headers(response.headers);
  for(const key of HOP_HEADERS)outgoing.delete(key);
  outgoing.delete('set-cookie');for(const cookie of response.headers.getSetCookie())outgoing.append('set-cookie',cookie);
  const location=outgoing.get('location');
  if(location){const destination=new URL(location,origin);if(destination.origin===origin.origin)outgoing.set('location',destination.pathname+destination.search+destination.hash);}
  outgoing.set('Cache-Control','no-store');
  return new Response(response.body,{status:response.status,headers:outgoing});
 }catch(error){return failure(error instanceof Error&&(error.name==='TimeoutError'||error.name==='AbortError')?504:502,'The API service is temporarily unavailable. Please try again.');}
}
