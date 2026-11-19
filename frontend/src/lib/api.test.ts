import {afterEach,describe,expect,it,vi} from 'vitest';
vi.mock('@lib/env',()=>({env:{}}));

describe('cookie session renewal',()=>{
 afterEach(()=>{vi.unstubAllGlobals();vi.resetModules();});
 it('shares one refresh between startup and other expired requests',async()=>{
  let refreshed=false;
  const fetch=vi.fn(async(url:string)=>{
   if(url.endsWith('/auth/refresh')){
    await new Promise(resolve=>setTimeout(resolve,10));refreshed=true;
    return Response.json({csrf_token:'renewed'});
   }
   return refreshed?Response.json({id:'account'}):Response.json({detail:'Expired'},{status:401});
  });
  vi.stubGlobal('fetch',fetch);const {api}=await import('./api');
  await Promise.all([api('/auth/me'),api('/users/settings')]);
  expect(fetch.mock.calls.filter(([url])=>url.endsWith('/auth/refresh'))).toHaveLength(1);
  expect(fetch.mock.calls).toHaveLength(5);
 });
 it('does not refresh on a service outage or retry invalid login credentials',async()=>{
  const fetch=vi.fn().mockResolvedValueOnce(Response.json({detail:'Unavailable'},{status:503})).mockResolvedValueOnce(Response.json({detail:'Invalid credentials'},{status:401}));
  vi.stubGlobal('fetch',fetch);const {api}=await import('./api');
  await expect(api('/auth/me')).rejects.toMatchObject({status:503});
  await expect(api('/auth/login',{method:'POST'})).rejects.toMatchObject({status:401});
  expect(fetch).toHaveBeenCalledTimes(2);
 });
});
