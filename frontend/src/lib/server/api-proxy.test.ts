import {describe,it,expect,vi} from 'vitest';
import {forwardApi} from './api-proxy';
const origin='https://api.visionary.test';
describe('same-origin API proxy',()=>{
 it('forwards JSON, cookies, CSRF and the original origin while keeping separate Set-Cookie headers',async()=>{
  const fetcher=vi.fn().mockResolvedValue(new Response('{"ok":true}',{headers:[['Content-Type','application/json'],['Set-Cookie','visionary_access=access; Path=/; HttpOnly; Secure'],['Set-Cookie','visionary_refresh=refresh; Path=/api/v1/auth; HttpOnly; Secure']]}));
  const request=new Request('https://web.visionary.test/api/v1/auth/login?next=1',{method:'POST',headers:{Origin:'https://web.visionary.test','Content-Type':'application/json',Cookie:'visionary_refresh=old','X-CSRF-Token':'csrf','X-Forwarded-For':'spoofed'},body:'{"email":"test@example.com"}'});
  const response=await forwardApi(request,{origin,fetcher});
  const [url,init]=fetcher.mock.calls[0];expect(url.href).toBe(origin+'/api/v1/auth/login?next=1');expect(new TextDecoder().decode(init.body)).toContain('test@example.com');expect(init.headers.get('cookie')).toBe('visionary_refresh=old');expect(init.headers.get('origin')).toBe('https://web.visionary.test');expect(init.headers.get('x-csrf-token')).toBe('csrf');expect(init.headers.has('x-forwarded-for')).toBe(false);expect(response.headers.getSetCookie()).toHaveLength(2);expect(response.headers.get('cache-control')).toBe('no-store');
 });
 it('preserves backend errors and rewrites backend redirects to same-origin paths',async()=>{
  const response=await forwardApi(new Request('https://web.visionary.test/api/v1/auth/me'),{origin,fetcher:vi.fn().mockResolvedValue(Response.json({detail:'Please sign in'},{status:401}))});expect(response.status).toBe(401);
  const redirect=await forwardApi(new Request('https://web.visionary.test/api/v1/users'),{origin,fetcher:vi.fn().mockResolvedValue(new Response(null,{status:307,headers:{Location:origin+'/api/v1/users/'}}))});expect(redirect.headers.get('location')).toBe('/api/v1/users/');
 });
 it('rejects missing, insecure, credential-bearing and recursive upstream origins',async()=>{
  const fetcher=vi.fn();for(const value of ['', 'http://evil.test','https://user:pass@api.test','https://api.test/api/v1','https://web.visionary.test'])expect((await forwardApi(new Request('https://web.visionary.test/api/v1/health'),{origin:value,fetcher})).status).toBe(503);expect(fetcher).not.toHaveBeenCalled();
 });
 it('caps request bodies and returns actionable upstream errors',async()=>{
  const fetcher=vi.fn();expect((await forwardApi(new Request('https://web.test/api/v1/detections',{method:'POST',body:'x'.repeat(2_000_001)}),{origin,fetcher})).status).toBe(413);expect(fetcher).not.toHaveBeenCalled();
  expect((await forwardApi(new Request('https://web.test/api/v1/health'),{origin,fetcher:vi.fn().mockRejectedValue(new Error('offline'))})).status).toBe(502);
 });
});
