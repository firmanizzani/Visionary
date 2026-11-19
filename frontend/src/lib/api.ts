import { env } from '@lib/env';
const base = env.PUBLIC_API_BASE_URL || '/api/v1';
let csrf = '';
let refreshRequest: Promise<void> | null = null;
async function refresh() {
 const r = await fetch(`${base}/auth/refresh`, {method:'POST', credentials:'include', headers:{'X-CSRF-Token':csrf}});
 if (!r.ok) throw new Error('Your session expired. Please sign in again.');
 csrf = (await r.json()).csrf_token;
}
export async function api<T = any>(path: string, options: RequestInit = {}, retry = true): Promise<T> {
 let response: Response;
 try { response = await fetch(`${base}${path}`, { ...options, credentials:'include', headers:{ ...(options.body ? {'Content-Type':'application/json'} : {}), 'X-CSRF-Token':csrf, ...options.headers } }); }
 catch { throw new Error('Cannot reach the application service. Check your connection and try again.'); }
 if (response.status === 401 && retry && !path.startsWith('/auth/')) {
  refreshRequest ??= refresh().finally(()=> refreshRequest = null); await refreshRequest;
  return api<T>(path, options, false);
 }
 const data = response.status === 204 ? null : await response.json().catch(()=>null);
 if (!response.ok) throw new Error(typeof data?.detail === 'string' ? data.detail : `Request failed (${response.status}). Please check your input.`);
 if (data?.csrf_token) csrf = data.csrf_token;
 return data as T;
}
export const json = (method: string, data: unknown): RequestInit => ({method, body: JSON.stringify(data)});
