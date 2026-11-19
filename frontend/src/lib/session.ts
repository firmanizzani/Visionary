import { writable } from 'svelte/store';
import type { User, Settings } from './types';
import { api, ApiError } from './api';
export const user = writable<User | null>(null);
export const sessionReady = writable(false);
export const sessionError = writable('');
export const settings = writable<Settings>({confidence_threshold:.5, visualization_mode:'both', show_confidence:true, preferred_camera:null});
let revision = 0;
let pending: Promise<void> | null = null;

// Invalidate startup requests when login/logout establishes a newer session.
export function setSession(me: User | null) {
 revision++; pending = null;
 user.set(me); sessionError.set(''); sessionReady.set(true);
}

export function loadSession(): Promise<void> {
 if (pending) return pending;
 const current = revision;
 sessionError.set('');
 sessionReady.set(false);
 const request = (async () => {
  try {
   const me = await api<User>('/auth/me');
   if (current !== revision) return;
   user.set(me);
   // Preferences are optional; an outage here must not discard valid authentication.
   try {
    const preferences = await api<Settings>('/users/settings');
    if (current === revision) settings.set(preferences);
   } catch { /* Keep the current preferences and authenticated account. */ }
  } catch (error) {
   if (current !== revision) return;
   if (error instanceof ApiError && error.status === 401) user.set(null);
   else sessionError.set('Unable to restore your session. Check your connection and try again.');
  } finally {
   if (current === revision) sessionReady.set(true);
  }
 })();
 pending = request;
 void request.finally(() => { if (pending === request) pending = null; });
 return request;
}
