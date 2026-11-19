<script lang="ts">
 import {Scan,ArrowUpRight,ShieldCheck} from 'lucide-svelte';
 import {user} from '@lib/session';
</script>
<footer class="site-footer">
 <div class="footer-inner">
  <div class="footer-main">
   <div class="footer-intro"><a href="/" class="brand"><Scan size={28}/><span>visionary<span class="brand-ai">ai</span></span></a><p>A closer look at the everyday.<br/>Object detection, right in your browser.</p><a href="/about#privacy" class="footer-privacy"><ShieldCheck size={17}/>Your privacy, explained <ArrowUpRight size={14}/></a></div>
   <nav aria-label="Explore"><h2>Explore</h2><a href="/detect/live">Live detection</a><a href="/detect/image">Image detection</a><a href="/#features">Features</a><a href={$user?'/dashboard':'/login'}>Your account <ArrowUpRight size={14}/></a></nav>
   <nav aria-label="Learn"><h2>Learn</h2><a href="/about">About Visionary</a><a href="/#how-it-works">How it works</a><a href="/about#categories">Supported categories</a><a href="/about#privacy">Privacy</a></nav>
  </div>
  <div class="footer-bottom"><small>© {new Date().getFullYear()} Visionary AI</small><span>A little more understanding.</span><a href="#top">Back to top ↑</a></div>
 </div>
</footer>

<style>
 .site-footer{background:var(--surface);margin-top:20px}
 .footer-inner{max-width:1440px;margin:auto;padding:56px 48px 28px}
 .footer-main{display:grid;grid-template-columns:2fr 1fr 1fr;gap:64px;padding-bottom:48px}
 .footer-intro .brand{font-size:27px;width:fit-content}
 .footer-intro p{font-size:15px;line-height:1.8;margin-top:20px;max-width:340px}
 .footer-privacy{display:flex;align-items:center;gap:8px;width:fit-content;font-size:13px;color:var(--accent);margin-top:24px;min-height:32px}
 .footer-main nav{display:flex;flex-direction:column;align-items:flex-start;gap:8px}
 .footer-main nav h2{font-size:15px;font-weight:650;margin:0 0 10px;letter-spacing:0}
 .footer-main nav a{display:flex;align-items:center;gap:6px;color:var(--muted);font-size:14px;min-height:32px;line-height:1.5}
 .site-footer a:hover{color:var(--accent)}
 .footer-bottom{display:flex;align-items:center;gap:30px;color:var(--muted);font-size:13px}
 .footer-bottom small{font-size:13px}.footer-bottom>a{margin-left:auto;min-height:32px;display:flex;align-items:center}
 @media(max-width:900px){.footer-inner{padding:44px 30px 24px}.footer-main{grid-template-columns:1.5fr 1fr 1fr;gap:30px}}
 @media(max-width:600px){.footer-inner{padding:36px 20px 24px}.footer-main{grid-template-columns:1fr 1fr;gap:32px 24px;padding-bottom:30px}.footer-intro{grid-column:1/-1}.footer-intro p{font-size:14px}.footer-privacy{margin-top:14px}.footer-main nav{gap:2px}.footer-main nav a{min-height:44px;font-size:13px}.footer-bottom{flex-wrap:wrap;gap:8px 20px}.footer-bottom>span{width:100%;order:3}.footer-bottom>a{min-height:44px}}
</style>
