import { writable } from 'svelte/store';
import type { User, Settings } from './types';
import { api } from './api';
export const user = writable<User | null>(null);
export const sessionReady = writable(false);
export const settings = writable<Settings>({confidence_threshold:.5, visualization_mode:'both', show_confidence:true, preferred_camera:null});
export async function loadSession() {
 try {
  let me: User;
  try { me=await api<User>('/auth/me'); } catch { await api('/auth/refresh',{method:'POST'});me=await api<User>('/auth/me'); }
  user.set(me); settings.set(await api<Settings>('/users/settings'));
 } catch { user.set(null); }
 finally {sessionReady.set(true);}
}
