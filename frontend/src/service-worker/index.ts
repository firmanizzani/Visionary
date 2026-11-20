import {self} from '$app/service-worker';
import {version} from '$app/env';

const PREFIX='visionary-shell-';
const CACHE=PREFIX+version;
const FALLBACK='/offline.html';
const CORE=[FALLBACK,'/icons/icon-192.png','/icons/icon-512.png','/icons/maskable-512.png','/icons/apple-touch-icon.png','/manifest.webmanifest'];

self.addEventListener('install',event=>{
 event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)));
 // Wait for existing tabs to close before activating a newer worker. Never
 // reload or replace code under a running camera/inference session.
});
self.addEventListener('activate',event=>{
 event.waitUntil((async()=>{
  for(const name of await caches.keys())if(name.startsWith(PREFIX)&&name!==CACHE)await caches.delete(name);
  await self.clients.claim();
 })());
});
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);
 if(request.method!=='GET'||url.origin!==self.location.origin)return;
 // Authentication, private snapshots, model downloads and inference WASM remain
 // under their existing network/storage policies; never cache these here.
 if(url.pathname.startsWith('/api/')||url.pathname.startsWith('/models/'))return;
 if(request.mode==='navigate'){
  event.respondWith(fetch(request).catch(async()=>{
   const fallback=await (await caches.open(CACHE)).match(FALLBACK);
   return fallback??new Response('You are offline. Reconnect and try again.',{status:503,headers:{'Content-Type':'text/plain'}});
  }));return;
 }
 const immutable=url.pathname.startsWith('/_app/immutable/')&&/\.(js|css|woff2?)$/.test(url.pathname);
 if(!CORE.includes(url.pathname)&&!immutable)return;
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE),cached=await cache.match(request);
  if(cached)return cached;
  const response=await fetch(request);
  if(response.ok&&response.type==='basic'&&!response.headers.get('cache-control')?.includes('no-store')){
   // A full cache must not turn a successful asset download into a failure.
   event.waitUntil(cache.put(request,response.clone()).catch(()=>{}));
  }
  return response;
 })());
});
