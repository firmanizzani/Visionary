<script lang="ts">
 import ThemeSwitch from './ThemeSwitch.svelte';
 import { goto } from '$app/navigation';
 import { Scan, ArrowUpRight, ArrowRight, ShieldCheck, Eye, EyeOff, Mail, LockKeyhole, UserRound, UserRoundPlus, LogIn, LoaderCircle } from 'lucide-svelte';
 import { api,json } from '@lib/api';
 import { user, loadSession } from '@lib/session';
 import Button from './ui/button.svelte';
 let {register=false}=$props();let name=$state(''),email=$state(''),password=$state(''),confirm=$state(''),show=$state(false),busy=$state(false),error=$state('');
 async function submit(e:SubmitEvent){e.preventDefault();error='';if(register&&password!==confirm){error='Passwords do not match. Enter the same password in both fields.';return;}busy=true;try{const result=await api('/auth/'+(register?'register':'login'),json('POST',register?{full_name:name,email,password,confirm_password:confirm}:{email,password}));user.set(result.user);await loadSession();await goto('/dashboard');}catch(e){error=(e as Error).message;}finally{busy=false;}}
</script>
<div class="auth-page auth-refined" class:auth-login={!register}>
 <header class="auth-header"><a href="/" class="brand"><Scan size={28}/><span>visionary<span class="brand-ai">ai</span></span></a><ThemeSwitch/></header>
 <main class="auth-layout">
  <section class="auth-story" aria-label="About Visionary">
   <div class="auth-art"><img src="/images/auth-objects.webp" alt="Illustration of headphones, a notebook and a cup" width="960" height="960" fetchpriority="high"/>
    <div class="auth-region headphones"><span>headphones</span></div><div class="auth-region book"><span>book</span></div><div class="auth-region cup"><span>cup</span></div>
   </div>
   <div class="auth-story-copy"><h2>A fresh look<br/>at the everyday.</h2><p>Your own space to explore, save, and see more.</p></div>
  </section>
  <section class="auth-form" aria-label={register?'Create account':'Sign in'}>
   <div class="auth-form-title"><h1>{register?'Create your account':'Welcome back.'}</h1><p>{register?'A place for everything you discover.':'Pick up where your curiosity left off.'}</p></div>
   <form onsubmit={submit}>
    {#if register}<label for="auth-name">Full name<span class="auth-input"><UserRound size={18}/><input id="auth-name" required maxlength="120" autocomplete="name" bind:value={name} placeholder="Your full name" disabled={busy}/></span></label>{/if}
    <label for="auth-email">Email address<span class="auth-input"><Mail size={18}/><input id="auth-email" required type="email" autocomplete="email" bind:value={email} placeholder="you@example.com" disabled={busy}/></span></label>
    <label for="auth-password">Password<span class="auth-input"><LockKeyhole size={18}/><input id="auth-password" required minlength="8" maxlength="128" type={show?'text':'password'} autocomplete={register?'new-password':'current-password'} bind:value={password} placeholder={register?'At least 8 characters':'Enter your password'} disabled={busy}/><button type="button" class="icon-btn" aria-label={show?'Hide password':'Show password'} aria-pressed={show} onclick={()=>show=!show}>{#if show}<EyeOff size={18}/>{:else}<Eye size={18}/>{/if}</button></span></label>
    {#if register}<label for="auth-confirm">Confirm password<span class="auth-input"><LockKeyhole size={18}/><input id="auth-confirm" required minlength="8" type={show?'text':'password'} autocomplete="new-password" bind:value={confirm} placeholder="Enter your password again" disabled={busy}/></span></label>{/if}
    {#if error}<div class="notice error" role="alert">{error}</div>{/if}
    <Button type="submit" disabled={busy}>{#if busy}<LoaderCircle size={18} class="spin"/>{:else if register}<UserRoundPlus size={18}/>{:else}<LogIn size={18}/>{/if}{busy?'Please wait...':register?'Create account':'Sign in'}{#if !busy}<ArrowRight size={18}/>{/if}</Button>
   </form>
   <p class="auth-switch">{register?'Already have an account?':'New to Visionary AI?'} <a href={register?'/login':'/register'}>{register?'Sign in':'Create an account'}</a></p>
   <div class="auth-guest"><a href="/detect/image">Explore without an account <ArrowUpRight size={15}/></a></div>

  </section>
 </main>
 <footer><span>Visionary AI. A little more understanding.</span><a href="/docs">Privacy & model guide <ArrowUpRight size={13}/></a></footer>
</div>
