import {defineEnvVars} from '@sveltejs/kit/env';
const optional=(value:string|undefined)=>value??'';
export const variables=defineEnvVars({
 BACKEND_ORIGIN:{schema:optional,description:'Private backend origin. HTTPS on Vercel; never exposed to the browser.'},
 VISIONARY_API_TARGET:{schema:optional,description:'Optional local/test backend override.'},
 VERCEL:{schema:optional,description:'Set by the Vercel platform.'}
});
