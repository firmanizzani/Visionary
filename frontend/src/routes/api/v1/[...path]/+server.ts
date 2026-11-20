import * as env from '$app/env/private';
import {dev} from '$app/env';
import type {RequestHandler} from './$types';
import {forwardApi} from '@lib/server/api-proxy';

export const config={maxDuration:60};
const proxy:RequestHandler=({request,fetch})=>forwardApi(request,{
 origin:env.VISIONARY_API_TARGET||env.BACKEND_ORIGIN||(dev?'http://127.0.0.1:8001':''),
 allowLocalHttp:env.VERCEL!=='1',fetcher:fetch
});
export const GET=proxy,POST=proxy,PUT=proxy,PATCH=proxy,DELETE=proxy,OPTIONS=proxy,HEAD=proxy;
