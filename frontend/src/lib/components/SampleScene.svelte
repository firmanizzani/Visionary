<script lang="ts">
 import {Scan,Layers} from 'lucide-svelte';
 let show=$state(true);
 let selected=$state('all');
 function select(name:string){selected=name;show=true;}
 const boxes=[{name:'potted plant',x:1,y:2,w:32,h:60},{name:'cup',x:60,y:41,w:16,h:22},{name:'book',x:20,y:60,w:47,h:31},{name:'keyboard',x:70,y:61,w:29,h:19}];
</script>
<figure class="sample-scene" class:focused={selected!=='all'} data-ui>
 <div class="sample-heading"><span><Scan size={16}/>A closer look</span><span>Example scene</span></div>
 <div class="sample-photo"><img src="/images/studio-desk.webp" alt="Illustrative desk scene with a plant, cup, open notebook and keyboard" width="1586" height="992" fetchpriority="high"/>{#if show}{#each boxes as box,index}{#if selected==='all'||selected===box.name}<div class="sample-box" style:--object-index={index} style:left={`${box.x}%`} style:top={`${box.y}%`} style:width={`${box.w}%`} style:height={`${box.h}%`}><span>{box.name}</span></div>{/if}{/each}{/if}</div>
 <div class="sample-explore"><span>Explore the sample</span><div role="group" aria-label="Choose a sample object"><button aria-pressed={selected==='all'} onclick={()=>select('all')}>All objects</button>{#each boxes as box}<button aria-pressed={selected===box.name} onclick={()=>select(box.name)}>{box.name==='potted plant'?'Plant':box.name.charAt(0).toUpperCase()+box.name.slice(1)}</button>{/each}</div></div>
 <figcaption><span>Sample annotations, not live predictions</span><button onclick={()=>show=!show} aria-pressed={show}><Layers size={15}/>{show?'Hide boxes':'Show boxes'}</button></figcaption>
</figure>

<style>
 .sample-explore{padding:16px 18px 4px}.sample-explore>span{display:block;font-size:13px;color:var(--muted);margin-bottom:9px}.sample-explore>div{display:flex;gap:6px;flex-wrap:wrap}
 .sample-explore button{background:transparent;color:var(--muted);padding:6px 10px;min-height:36px;border-radius:5px;font-size:13px}.sample-explore button:hover{background:var(--raised);color:var(--ink)}.sample-explore button[aria-pressed=true]{background:var(--accent-soft);color:var(--accent)}
 .focused :global(.sample-box){animation-delay:0ms}
 @media(max-width:600px){.sample-explore{padding:14px 12px 2px}.sample-explore>div{gap:2px}.sample-explore button{min-height:44px;padding:6px 8px}}
</style>
