<script lang="ts">
 import '../landing-motion.css';
 import {onMount} from 'svelte';
 import {animateLanding} from '@lib/landing-motion';
 import {Scan,ArrowUpRight,Video,Image,ShieldCheck,Layers,ArrowRight,Bookmark} from 'lucide-svelte';
 import PublicNav from '@lib/components/PublicNav.svelte';
 import PublicFooter from '@lib/components/PublicFooter.svelte';
 import SampleScene from '@lib/components/SampleScene.svelte';import {MODEL_LABELS} from '@lib/ai/model';
 let landing:HTMLDivElement;
 onMount(()=>animateLanding(landing));
 const studies=[{name:'potted plant',x:0,y:0,w:.34,h:.63},{name:'cup',x:.58,y:.39,w:.2,h:.25},{name:'book',x:.18,y:.58,w:.49,h:.35},{name:'keyboard',x:.69,y:.59,w:.31,h:.23}];
</script>
<div id="top" class="landing studio-landing" bind:this={landing}>
 <PublicNav/>
 <main>
  <section class="hero"><div class="hero-copy"><h1>See what's in front of you.</h1><p>Find the familiar in every frame. Explore objects with your camera or a photo, then keep the discoveries that matter.</p><div class="hero-actions"><a class="btn" href="/detect/live"><Video size={18}/>Try live detection <ArrowUpRight size={17}/></a><a class="text-link" href="/detect/image">Upload a photo <ArrowUpRight size={16}/></a></div><div class="hero-reassurance"><ShieldCheck size={16}/>On your device. No account needed to explore.</div></div><SampleScene/></section>
  <div class="studio-principles"><span><Scan size={18}/>Detect objects</span><span><Layers size={18}/>Explore their shapes</span><span><Bookmark size={18}/>Save your discoveries</span><a href="/about#model">Meet the model <ArrowUpRight size={15}/></a></div>
  <section id="features" class="studio-capabilities"><div class="studio-section-intro"><h2>A different way<br/>to look at everyday.</h2><p>Look in the moment. Revisit the details. Keep what you discover.</p></div><div class="studio-feature-list"><a href="/detect/live"><Video size={24}/><div><h3>See it as it happens.</h3><p>Explore labels, shapes, and counts while your camera keeps moving.</p></div><ArrowUpRight size={20}/></a><a href="/detect/image"><Image size={24}/><div><h3>Give a photo a second look.</h3><p>Choose a photo and take your time with its objects and shapes.</p></div><ArrowUpRight size={20}/></a><a href="/history"><Bookmark size={24}/><div><h3>Build a collection of insights.</h3><p>Save a snapshot to your private history and return to it whenever you like.</p></div><ArrowUpRight size={20}/></a></div></section>
  <section class="studio-vocabulary"><div><span class="vocabulary-total">{MODEL_LABELS.length.toLocaleString()}</span><h2>Category names.<br/>Room to explore.</h2><p>From books and cups to clothing, furniture, and electronics. Local label matching helps the model compare what it sees.</p><a href="/about#categories" class="text-link">Explore supported categories <ArrowUpRight size={16}/></a></div><div class="vocabulary-preview" aria-label="Examples of supported categories"><div class="object-study">{#each studies as item}<figure><div style:aspect-ratio={`${1.599*item.w/item.h}`}><img src="/images/studio-desk.webp" alt={`Illustrative ${item.name}`} loading="lazy" style:width={`${100/item.w}%`} style:left={`${-item.x/item.w*100}%`} style:top={`${-item.y/item.h*100}%`}/></div><figcaption>{item.name}</figcaption></figure>{/each}</div><p>A supported name is not an accuracy guarantee. Results depend on the object, lighting, and device.</p></div></section>
  <section id="how-it-works" class="studio-privacy privacy-sequence"><div><ShieldCheck size={30}/><h2>Your camera.<br/>Your space.</h2><p>Camera frames are analyzed inside your browser. Only snapshots you choose to save are uploaded to private storage.</p><a href="/about#privacy" class="text-link">How your data is handled <ArrowUpRight size={16}/></a></div><div class="studio-flow"><div><Video size={24}/><span>Choose a view</span><p>Camera or uploaded photo</p></div><ArrowRight size={20}/><div><Scan size={24}/><span>Analyze on your device</span><p>Detection, masks, label matching</p></div><ArrowRight size={20}/><div><Bookmark size={24}/><span>Explore and save</span><p>Your results, your collection</p></div></div></section>
  <section class="final-cta"><h2>A closer look starts here.</h2><p>Open your camera or choose a photo.</p><a class="btn" href="/detect/live">Open your workspace <ArrowUpRight size={17}/></a></section>
 </main>
 <PublicFooter/>
</div>
