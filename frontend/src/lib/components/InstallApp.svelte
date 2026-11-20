<script lang="ts">
 import {Download, X} from 'lucide-svelte';
 import {tick} from 'svelte';
 import {pwaInstalled,promptInstall,installInstructions} from '@lib/pwa';
 let expanded=$state(false),busy=$state(false),message=$state(''),trigger=$state<HTMLButtonElement>();
 async function closeHelp(){expanded=false;await tick();trigger?.focus();}
 async function install(){
  if(busy)return;
  busy=true;
  try{
   const outcome=await promptInstall();
   if(outcome==='unavailable'){message=installInstructions();expanded=true;}
   else expanded=false;
  }catch{message='The install window could not open. '+installInstructions();expanded=true;}
  finally{busy=false;}
 }
</script>

{#if !$pwaInstalled}
 <div class="install-app">
  {#if !expanded}
   <button class="install-trigger" bind:this={trigger} type="button" onclick={install} disabled={busy}><Download size={18} aria-hidden="true"/>{busy?'Opening installer…':'Install app'}</button>
  {:else}
   <div class="install-help" id="install-app-help">
    <div class="install-heading"><strong>Install Visionary AI</strong><button type="button" onclick={closeHelp} aria-label="Close install instructions"><X size={15}/></button></div>
    <p role="status">{message}</p>
    <p class="install-note">Open it from your home screen or desktop. Account features need an internet connection.</p>
   </div>
  {/if}
 </div>
{/if}

<style>
 .install-trigger{display:flex;align-items:center;gap:11px;width:100%;min-height:46px;padding:13px 12px;border:0;border-radius:9px;background:transparent;color:var(--muted);font:inherit;font-size:14px;font-weight:500;text-align:start;cursor:pointer}
 .install-trigger:hover{background:var(--hover);color:var(--ink)}
 .install-trigger:disabled{opacity:.6;cursor:wait}
 .install-help{margin:0;padding:8px 12px 12px}
 .install-heading{display:flex;align-items:center;justify-content:space-between;gap:4px;font-size:12px;color:var(--ink)}
 .install-heading button{display:grid;place-items:center;flex-shrink:0;width:28px;height:28px;padding:0;border:0;background:transparent;color:var(--muted);border-radius:5px;cursor:pointer}
 .install-heading button:hover{background:var(--hover);color:var(--ink)}
 .install-help p{margin:8px 0 0;color:var(--ink);font-size:12px;line-height:1.65;overflow-wrap:anywhere}
 .install-help .install-note{color:var(--muted)}
 @media(max-width:1050px){.install-trigger{min-height:48px}.install-heading button{width:44px;height:44px}}
</style>
