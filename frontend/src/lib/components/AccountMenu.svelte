<script lang="ts">
 import {onMount,tick} from 'svelte';
 import {page} from '$app/state';
 import {ArrowUpRight,ChevronUp,LogOut,Check} from 'lucide-svelte';
 import {user} from '@lib/session';
 import {pwaInstalled} from '@lib/pwa';
 import InstallApp from './InstallApp.svelte';
 let {onlogout}:{onlogout:()=>Promise<void>}=$props();
 let open=$state(false),root=$state<HTMLDivElement>(),trigger=$state<HTMLButtonElement>(),panel=$state<HTMLDivElement>();
 $effect(()=>{page.url.pathname;open=false;});
 async function toggle(){open=!open;if(open){await tick();panel?.querySelector<HTMLButtonElement>('button')?.focus();}}
 onMount(()=>{
  const outside=(event:PointerEvent)=>{if(event.target instanceof Node&&!root?.contains(event.target))open=false;};
  const escape=(event:KeyboardEvent)=>{if(open&&event.key==='Escape'){event.preventDefault();event.stopPropagation();open=false;trigger?.focus();}};
  document.addEventListener('pointerdown',outside);
  document.addEventListener('keydown',escape,true);
  return()=>{document.removeEventListener('pointerdown',outside);document.removeEventListener('keydown',escape,true);};
 });
</script>

<div class="account-shell" bind:this={root}>
 {#if open}
  <div class="account-options" id="account-options" bind:this={panel} role="region" aria-label="Account options">
   {#if $pwaInstalled}<p class="installed"><Check size={17} aria-hidden="true"/>App installed</p>{:else}<InstallApp/>{/if}
  </div>
 {/if}
 <div class="account">
  <button class="account-trigger" type="button" bind:this={trigger} aria-label="Open account options" aria-expanded={open} aria-controls="account-options" onclick={toggle}>
   <span class="account-avatar"><span class="avatar">{$user?.full_name.charAt(0).toUpperCase()||'G'}</span><ChevronUp size={12} class={open?'chevron open':'chevron'} aria-hidden="true"/></span>
   <span class="account-identity" title={$user?.full_name||'Guest workspace'}><strong>{$user?.full_name||'Guest workspace'}</strong><small>{$user?'Personal account':'Explore without an account'}</small></span>
  </button>
  {#if $user}<button class="icon-btn" onclick={onlogout} aria-label="Sign out"><LogOut size={16}/></button>{:else}<a class="icon-btn" href="/login" aria-label="Sign in"><ArrowUpRight size={17}/></a>{/if}
 </div>
</div>

<style>
 .account-shell{position:relative}
 .account{gap:4px}
 .account-trigger{display:flex;align-items:center;gap:9px;flex:1;min-width:0;min-height:48px;padding:6px 2px;border:0;border-radius:8px;background:transparent;color:var(--ink);font:inherit;text-align:start;cursor:pointer}
 .account-trigger:hover{background:var(--hover)}
 .account-identity{flex:1;min-width:0}
 .account-identity small{white-space:normal}
 .account-avatar{position:relative;flex-shrink:0}
 .account-trigger :global(.avatar){flex-shrink:0}
 .account-trigger :global(.chevron){position:absolute;inset-inline-end:-3px;bottom:-2px;color:var(--muted);background:var(--bg);border-radius:50%;transform:rotate(0)}
 .account-trigger :global(.chevron.open){transform:rotate(180deg)}
 .account-options{position:absolute;inset-inline:0;bottom:calc(100% - 10px);z-index:3;padding:5px;background:var(--surface);border:1px solid var(--border);border-radius:12px;max-height:min(420px,60dvh);overflow-y:auto;overscroll-behavior:contain}
 .installed{display:flex;align-items:center;gap:10px;color:var(--muted);font-size:13px;padding:12px;margin:0}
 .icon-btn{flex-shrink:0;min-width:36px;min-height:44px}
 @media(max-width:1050px){.icon-btn{min-width:44px}.account-options{max-height:55dvh}}
</style>
