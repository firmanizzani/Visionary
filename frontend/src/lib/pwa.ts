import {writable} from 'svelte/store';

interface InstallPrompt extends Event {
 prompt(): Promise<void>;
 userChoice: Promise<{outcome:'accepted'|'dismissed'}>;
}
export const pwaInstalled=writable(false);
let deferred:InstallPrompt|null=null;

// Start at the root layout so an install event on the landing page is retained
// when the visitor navigates into the workspace.
export function initializePwa(){
 const standalone=matchMedia('(display-mode: standalone)');
 const sync=()=>pwaInstalled.set(standalone.matches||Boolean((navigator as Navigator&{standalone?:boolean}).standalone));
 const capture=(event:Event)=>{event.preventDefault();deferred=event as InstallPrompt;};
 const installed=()=>{deferred=null;pwaInstalled.set(true);};
 sync();standalone.addEventListener('change',sync);
 window.addEventListener('beforeinstallprompt',capture);
 window.addEventListener('appinstalled',installed);
 return()=>{standalone.removeEventListener('change',sync);window.removeEventListener('beforeinstallprompt',capture);window.removeEventListener('appinstalled',installed);deferred=null;};
}

export async function promptInstall():Promise<'accepted'|'dismissed'|'unavailable'>{
 const nativeInstall=(navigator as Navigator&{install?:()=>Promise<void>}).install;
 if(typeof nativeInstall==='function'){
  try{
   // Invoke synchronously from the button click, before any await, to retain
   // the user activation required by the Web Install API.
   await nativeInstall.call(navigator);
   deferred=null;pwaInstalled.set(true);
   return 'accepted';
  }catch(error){if(error instanceof DOMException&&error.name==='AbortError')return 'dismissed';throw error;}
 }
 const prompt=deferred;
 if(!prompt)return 'unavailable';
 deferred=null;
 await prompt.prompt();
 const {outcome}=await prompt.userChoice;
 if(outcome==='accepted')pwaInstalled.set(true);
 return outcome;
}

export function installInstructions(){
 const ios=/iPhone|iPad|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
 if(ios)return 'In Safari, tap Share, then Add to Home Screen. Keep Open as Web App enabled if shown, then tap Add.';
 if(/Android/.test(navigator.userAgent))return 'Open the browser menu and choose Install app or Add to Home screen. If neither appears, open this site in Chrome and try again.';
 return 'Look for the install icon in your browser’s address bar, or open its menu and choose Install Visionary AI. If unavailable, try Chrome or Microsoft Edge.';
}
