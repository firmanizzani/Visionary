import {writable} from 'svelte/store';
export type Theme='dark'|'light';
export const theme=writable<Theme>('dark');
const key='visionary-theme';
export function initializeTheme(){
 const media=matchMedia('(prefers-color-scheme: dark)');
 let choice:Theme='dark';
 try{const saved=localStorage.getItem(key);if(saved==='dark'||saved==='light')choice=saved;else if(saved==='system')choice=media.matches?'dark':'light';}catch{}
 theme.set(choice);
 const unsubscribe=theme.subscribe(value=>{
  choice=value;apply();try{localStorage.setItem(key,value);}catch{}
 });
 function apply(){
  const resolved=choice;
  document.documentElement.dataset.theme=resolved;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content',resolved==='dark'?'#171717':'#f3f5f5');
 }
 const storage=(event:StorageEvent)=>{if(event.key===key){const value=event.newValue;theme.set(value==='light'?'light':value==='system'&&!media.matches?'light':'dark');}};
 window.addEventListener('storage',storage);
 return ()=>{unsubscribe();window.removeEventListener('storage',storage);};
}
