<script lang="ts">
 import {Scan,Layers} from 'lucide-svelte';
 let show=$state(true);
 const boxes=[{name:'potted plant',x:1,y:2,w:32,h:60},{name:'cup',x:60,y:41,w:16,h:22},{name:'book',x:20,y:60,w:47,h:31},{name:'keyboard',x:70,y:61,w:29,h:19}];
</script>
<figure class="sample-scene" data-ui>
 <div class="sample-heading"><span><Scan size={16}/>A closer look</span><span>Example scene</span></div>
 <div class="sample-photo"><img src="/images/studio-desk.webp" alt="Illustrative desk scene with a plant, cup, open notebook and keyboard" width="1586" height="992" fetchpriority="high"/>{#if show}{#each boxes as box}<div class="sample-box" style:left={`${box.x}%`} style:top={`${box.y}%`} style:width={`${box.w}%`} style:height={`${box.h}%`}><span>{box.name}</span></div>{/each}{/if}</div>
 <figcaption><span>Sample annotations, not live predictions</span><button onclick={()=>show=!show} aria-pressed={show}><Layers size={15}/>{show?'Hide boxes':'Show boxes'}</button></figcaption>
</figure>
