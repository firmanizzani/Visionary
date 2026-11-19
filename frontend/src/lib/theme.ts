import {writable} from 'svelte/store';
export type Theme='dark'|'light'|'system';
export const theme=writable<Theme>('dark');
const key='visionary-theme';
export function initializeTheme(){
 const media=matchMedia('(prefers-color-scheme: dark)');
 let choice:Theme='dark';
 try{const saved=localStorage.getItem(key);if(saved==='dark'||saved==='light'||saved==='system')choice=saved;}catch{}
 theme.set(choice);
 const unsubscribe=theme.subscribe(value=>{
  choice=value;apply();try{localStorage.setItem(key,value);}catch{}
 });
 function apply(){
  const resolved=choice==='system'?(media.matches?'dark':'light'):choice;
  document.documentElement.dataset.theme=resolved;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content',resolved==='dark'?'#171717':'#f3f5f5');
 }
 const changed=()=>apply();media.addEventListener('change',changed);
 const storage=(event:StorageEvent)=>{if(event.key===key){const value=event.newValue;theme.set(value==='light'||value==='system'?value:'dark');}};
 window.addEventListener('storage',storage);
 return ()=>{unsubscribe();media.removeEventListener('change',changed);window.removeEventListener('storage',storage);};
}
