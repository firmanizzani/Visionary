import {beforeEach,describe,expect,it,vi} from 'vitest';
import {get} from 'svelte/store';

const {api}=vi.hoisted(()=>({api:vi.fn()}));
vi.mock('./api',()=>({api,ApiError:class ApiError extends Error {constructor(message:string,public status:number){super(message);}}}));
import {ApiError} from './api';

describe('session restoration',()=>{
 beforeEach(()=>{vi.resetModules();api.mockReset();});
 it('keeps a valid account when preferences are unavailable',async()=>{
  const session=await import('./session');
  api.mockResolvedValueOnce({id:'account'}).mockRejectedValueOnce(new ApiError('Unavailable',503));
  await session.loadSession();
  expect(get(session.user)).toEqual({id:'account'});
  expect(get(session.sessionReady)).toBe(true);
 });
 it('shares startup requests and only clears the user for an authentication rejection',async()=>{
  const session=await import('./session');
  api.mockRejectedValue(new ApiError('Unavailable',503));
  const a=session.loadSession(),b=session.loadSession();
  expect(a).toBe(b);await a;
  expect(api).toHaveBeenCalledTimes(1);
  expect(get(session.sessionError)).toContain('try again');
  api.mockRejectedValue(new ApiError('Expired',401));await session.loadSession();
  expect(get(session.user)).toBeNull();expect(get(session.sessionError)).toBe('');
 });
 it('ignores a stale startup rejection after a successful login',async()=>{
  const session=await import('./session');
  let reject!:(reason:Error)=>void;
  api.mockImplementationOnce(()=>new Promise((_,fail)=>reject=fail));
  const startup=session.loadSession();
  session.setSession({id:'new-account'} as any);
  reject(new ApiError('Expired',401));await startup;
  expect(get(session.user)?.id).toBe('new-account');
  expect(get(session.sessionReady)).toBe(true);
 });
 it('does not restore an account from an in-flight request after logout',async()=>{
  const session=await import('./session');
  let resolve!:(me:unknown)=>void;
  api.mockImplementationOnce(()=>new Promise(done=>resolve=done));
  const startup=session.loadSession();session.setSession(null);
  resolve({id:'old-account'});await startup;
  expect(get(session.user)).toBeNull();expect(api).toHaveBeenCalledTimes(1);
 });
});
