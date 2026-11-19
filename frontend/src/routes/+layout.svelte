<script lang="ts">
 import '../app.css';
 import '../studio-overrides.css';
 import '../auth.css';
 import '@fontsource/manrope/400.css';
 import '@fontsource/manrope/500.css';
 import '@fontsource/manrope/600.css';
 import '@fontsource/manrope/700.css';
 import ThemeSwitch from '@lib/components/ThemeSwitch.svelte';
 import {initializeTheme} from '@lib/theme';
 import { onMount } from 'svelte';
 import { page } from '$app/state';
 import { goto } from '$app/navigation';
 import { user, loadSession, setSession } from '@lib/session';
 import { api } from '@lib/api';
 import { Scan, LayoutDashboard, Video, Image, History, ChartNoAxesCombined, Settings, ArrowUpRight, Menu, X, LogOut, ChevronRight, ShieldCheck } from 'lucide-svelte';
 let {children}=$props();let menu=$state(false);
 let path=$derived(page.url.pathname);
 const nav=[{href:'/dashboard',label:'Overview',icon:LayoutDashboard},{href:'/detect/live',label:'Live detection',icon:Video},{href:'/detect/image',label:'Image detection',icon:Image},{href:'/history',label:'Detection history',icon:History},{href:'/analytics',label:'Analytics',icon:ChartNoAxesCombined}];
 let workspace=$derived(!['/','/about','/login','/register'].includes(path));
 let title=$derived(nav.find(n=>path.startsWith(n.href))?.label || (path==='/settings'?'Profile & settings':'Detection details'));
 onMount(()=>{document.documentElement.dataset.appReady='true';void loadSession();return initializeTheme();});
 async function logout(){try{await api('/auth/logout',{method:'POST'});setSession(null);await goto('/');}catch(e){alert((e as Error).message);}}
</script>
<svelte:head><title>Visionary AI</title><meta name="description" content="See, understand, and count the world around you. Private object detection and segmentation, powered by AI in your browser."/></svelte:head>
{#if workspace}
 <div class="workspace">
  <aside class:open={menu}>
   <a href="/" class="brand"><Scan size={28} strokeWidth={2.3}/><span>visionary<span class="brand-ai">ai</span></span></a>
   <button class="mobile-close icon-btn" onclick={()=>menu=false} aria-label="Close menu"><X/></button>
   <div class="workspace-label">Personal workspace <span class="tiny-dot"></span></div>
   <nav aria-label="Main navigation">{#each nav as item}<a onclick={()=>menu=false} href={item.href} class:active={path.startsWith(item.href)}><item.icon size={18}/>{item.label}{#if path.startsWith(item.href)}<ChevronRight size={14} class="nav-chevron"/>{/if}</a>{/each}</nav>
   <div class="sidebar-bottom"><div class="privacy-note"><ShieldCheck size={19}/><strong>Private by design</strong><p>Your camera stays on your device. You choose what to save.</p><a href="/#how-it-works">How it works <ArrowUpRight size={13}/></a></div><a href="/settings" class:active={path==='/settings'}><Settings size={18}/>Profile & settings</a>
   <div class="account"><span class="avatar">{$user?.full_name.charAt(0).toUpperCase() || 'G'}</span><div><strong>{$user?.full_name || 'Guest workspace'}</strong><small>{$user?'Personal account':'Explore without an account'}</small></div>{#if $user}<button class="icon-btn" onclick={logout} aria-label="Sign out"><LogOut size={16}/></button>{:else}<a href="/login" aria-label="Sign in"><ArrowUpRight size={17}/></a>{/if}</div></div>
  </aside>
  <div class="workspace-body"><header class="workspace-top"><div><button class="icon-btn mobile-menu" onclick={()=>menu=!menu} aria-label="Open menu"><Menu size={20}/></button><span>Workspace</span><ChevronRight size={13}/><strong>{title}</strong></div><div class="top-right"><ThemeSwitch/><span class="local-badge"><span class="tiny-dot"></span>On-device AI</span>{#if !$user}<a href="/login">Sign in <ArrowUpRight size={15}/></a>{:else}<span class="avatar small">{$user.full_name.charAt(0)}</span>{/if}</div></header><main class="app-main">{@render children()}</main><footer class="app-footer"><span>Visionary AI · See beyond the obvious.</span><span>YOLOE segmentation <span class="tiny-dot"></span> Browser inference</span></footer></div>
 </div>
{:else}{@render children()}{/if}
