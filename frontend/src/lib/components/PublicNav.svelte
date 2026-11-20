<script lang="ts">
 import {page} from '$app/state';
 import {Scan,ArrowRight,Menu,X} from 'lucide-svelte';
 import {user} from '@lib/session';
 import ThemeSwitch from './ThemeSwitch.svelte';
 let menu=$state(false);
 let home=$derived(page.url.pathname==='/');
 let section=$state('home');
 let active=$derived(home?section:'about');
 $effect(()=>{page.url.pathname;menu=false;});
 $effect(()=>{
  if(!home)return;
  let frame=0;
  // Section history should return to its anchor even during rapid Back/Forward actions.
  const restoreSection=()=>{
   if(frame)cancelAnimationFrame(frame);
   const hash=location.hash;
   if(hash!=='#features'&&hash!=='#how-it-works')return;
   frame=requestAnimationFrame(()=>{
    frame=0;
    if(location.pathname==='/'&&location.hash===hash)document.getElementById(hash.slice(1))?.scrollIntoView({block:'start',behavior:'instant'});
   });
  };
  window.addEventListener('popstate',restoreSection);
  return()=>{window.removeEventListener('popstate',restoreSection);if(frame)cancelAnimationFrame(frame);};
 });
 $effect(()=>{
  if(!home)return;
  let frame=0;
  const update=()=>{
   frame=0;
   const boundary=(document.querySelector('.public-nav')?.getBoundingClientRect().height||96)+32;
   const features=document.getElementById('features'),how=document.getElementById('how-it-works');
   section=how&&how.getBoundingClientRect().top<=boundary?'how-it-works':features&&features.getBoundingClientRect().top<=boundary?'features':'home';
  };
  const schedule=()=>{if(!frame)frame=requestAnimationFrame(update);};
  window.addEventListener('scroll',schedule,{passive:true});
  window.addEventListener('resize',schedule,{passive:true});
  schedule();
  return()=>{window.removeEventListener('scroll',schedule);window.removeEventListener('resize',schedule);if(frame)cancelAnimationFrame(frame);};
 });
</script>
<nav class="public-nav" aria-label="Main navigation">
 <a href="/" class="brand"><Scan size={29}/><span>visionary<span class="brand-ai">ai</span></span></a>
 <div id="public-navigation" class:mobile-open={menu} class="public-links">
  <a href="/" aria-current={active==='home'?'page':undefined} onclick={()=>menu=false}>Home</a>
  <a href={home?'#features':'/#features'} aria-current={active==='features'?'location':undefined} onclick={()=>menu=false}>Features</a>
  <a href={home?'#how-it-works':'/#how-it-works'} aria-current={active==='how-it-works'?'location':undefined} onclick={()=>menu=false}>How it works</a>
  <a href="/about" aria-current={active==='about'?'page':undefined} onclick={()=>menu=false}>About</a>
 </div>
 <div class="nav-actions"><ThemeSwitch/><a class="btn public-auth" class:signed-in={!!$user} href={$user?'/dashboard':'/login'}>{$user?'Dashboard':'Login'}{#if $user} <ArrowRight size={16}/>{/if}</a><button class="icon-btn mobile-menu" onclick={()=>menu=!menu} aria-label="Toggle navigation" aria-expanded={menu} aria-controls="public-navigation">{#if menu}<X/>{:else}<Menu/>{/if}</button></div>
</nav>

<style>
 :global(.studio-landing) .public-nav{position:sticky;top:0;z-index:50;max-width:none;background:var(--bg)}
 .public-links a[aria-current]{color:var(--accent);font-weight:700}
 :global(.studio-landing) .nav-actions>.public-auth{min-height:44px;padding:10px 32px;font-size:15px}
 @media(max-width:600px){:global(.studio-landing) .nav-actions>.public-auth{min-height:44px;padding:10px 24px;font-size:14px}}
 @media(max-width:600px){:global(.studio-landing) .nav-actions>.public-auth.signed-in{padding:10px 14px;font-size:13px}.public-auth.signed-in :global(svg){display:none}}
 @media(max-width:900px){:global(.studio-landing) .public-links.mobile-open{top:100%}}
 @media(min-width:1441px){:global(.studio-landing) .public-nav{padding-left:max(48px,calc((100vw - 1344px)/2));padding-right:max(48px,calc((100vw - 1344px)/2))}}
</style>
