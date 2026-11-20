<script lang="ts">
 import '../app.css';
 import '../studio-overrides.css';
 import '../auth.css';
 import '@fontsource/manrope/400.css';
 import '@fontsource/manrope/500.css';
 import '@fontsource/manrope/600.css';
 import '@fontsource/manrope/700.css';
 import ThemeSwitch from '@lib/components/ThemeSwitch.svelte';
 import AccountMenu from '@lib/components/AccountMenu.svelte';
 import {initializePwa} from '@lib/pwa';
 import {initializeTheme} from '@lib/theme';
 import { onMount, tick } from 'svelte';
 import { page } from '$app/state';
 import { goto } from '$app/navigation';
 import { user, loadSession, setSession } from '@lib/session';
 import { api } from '@lib/api';
 import { Scan, LayoutDashboard, Video, Image, History, ChartNoAxesCombined, Settings, ArrowUpRight, Menu, X, ChevronRight, ShieldCheck } from 'lucide-svelte';
 let {children}=$props();let menu=$state(false),compact=$state(false);
 let sidebar=$state<HTMLElement>(),menuButton=$state<HTMLButtonElement>(),closeButton=$state<HTMLButtonElement>();
 let path=$derived(page.url.pathname);
 const nav=[{href:'/dashboard',label:'Overview',icon:LayoutDashboard},{href:'/detect/live',label:'Live detection',icon:Video},{href:'/detect/image',label:'Image detection',icon:Image},{href:'/history',label:'Detection history',icon:History},{href:'/analytics',label:'Analytics',icon:ChartNoAxesCombined}];
 let workspace=$derived(!['/','/about','/login','/register'].includes(path));
 onMount(()=>{
  document.documentElement.dataset.appReady='true';void loadSession();
  const query=matchMedia('(max-width:1050px)'),sync=()=>compact=query.matches;
  sync();query.addEventListener('change',sync);const stopTheme=initializeTheme(),stopPwa=initializePwa();
  return()=>{query.removeEventListener('change',sync);stopTheme();stopPwa();};
 });
 $effect(()=>{path;menu=false;});
 $effect(()=>{
  if(!menu||!compact||!sidebar)return;
  const overflow=document.body.style.overflow;document.body.style.overflow='hidden';
  void tick().then(()=>closeButton?.focus());
  return()=>{document.body.style.overflow=overflow;if(menuButton?.isConnected&&matchMedia('(max-width:1050px)').matches)menuButton.focus();};
 });
 function menuKeydown(event:KeyboardEvent){
  if(!menu||!compact||!sidebar)return;
  if(event.key==='Escape'){event.preventDefault();menu=false;}
  if(event.key==='Tab'){
   const controls=Array.from(sidebar.querySelectorAll<HTMLElement>('a[href],button:not([disabled])')).filter(node=>node.getClientRects().length);
   const first=controls[0],last=controls.at(-1);
   if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}
   else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}
  }
 }
 async function logout(){try{await api('/auth/logout',{method:'POST'});setSession(null);await goto('/');}catch(e){alert((e as Error).message);}}
</script>
<svelte:head><title>Visionary AI</title><meta name="description" content="See, understand, and count the world around you. Private object detection and segmentation, powered by AI in your browser."/></svelte:head>
<svelte:window onkeydown={menuKeydown}/>
{#if workspace}
 <div class="workspace">
  {#if compact&&menu}<button class="sidebar-scrim" tabindex="-1" aria-label="Close navigation" onclick={()=>menu=false}></button>{/if}
  <aside bind:this={sidebar} id="workspace-navigation" class:open={menu} inert={compact&&!menu} role={compact?'dialog':undefined} aria-modal={compact&&menu?true:undefined} aria-label="Workspace navigation">
   <a href="/" class="brand"><Scan size={28} strokeWidth={2.3}/><span>visionary<span class="brand-ai">ai</span></span></a>
   <button bind:this={closeButton} class="mobile-close icon-btn" onclick={()=>menu=false} aria-label="Close menu"><X/></button>
   <div class="workspace-label">Personal workspace <span class="tiny-dot"></span></div>
   <nav aria-label="Main navigation">{#each nav as item}<a onclick={()=>menu=false} href={item.href} class:active={path.startsWith(item.href)}><item.icon size={18}/>{item.label}{#if path.startsWith(item.href)}<ChevronRight size={14} class="nav-chevron"/>{/if}</a>{/each}</nav>
   <div class="sidebar-bottom"><div class="privacy-note"><ShieldCheck size={19}/><strong>Private by design</strong><p>Your camera stays on your device. You choose what to save.</p><a href="/#how-it-works">How it works <ArrowUpRight size={13}/></a></div><a href="/settings" class:active={path==='/settings'}><Settings size={18}/>Profile & settings</a>
   <AccountMenu onlogout={logout}/></div>
  </aside>
  <div class="workspace-body" inert={compact&&menu}><header class="workspace-top"><div><button bind:this={menuButton} class="icon-btn mobile-menu" onclick={()=>menu=!menu} aria-label="Open menu" aria-expanded={menu} aria-controls="workspace-navigation"><Menu size={20}/></button><a class="workspace-mobile-brand" href="/dashboard" aria-label="Visionary AI workspace"><Scan size={20} aria-hidden="true"/><span>visionary<span class="brand-ai">ai</span></span></a></div><div class="top-right"><ThemeSwitch/><span class="local-badge"><span class="tiny-dot"></span>On-device AI</span>{#if !$user}<a href="/login">Sign in <ArrowUpRight size={15}/></a>{/if}</div></header><main class="app-main">{@render children()}</main><footer class="app-footer"><span>Visionary AI · See beyond the obvious.</span><span>YOLOE segmentation <span class="tiny-dot"></span> Browser inference</span></footer></div>
 </div>
{:else}{@render children()}{/if}
