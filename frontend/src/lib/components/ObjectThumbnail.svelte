<script lang="ts">
 import type {DetectedObject} from '@lib/types';
 let {source,object}:{source:HTMLCanvasElement|null;object:DetectedObject}=$props();
 let canvas=$state<HTMLCanvasElement>();
 $effect(()=>{
  const c=canvas,s=source;if(!c||!s)return;
  c.width=96;c.height=80;const ctx=c.getContext('2d')!;
  const [x1,y1,x2,y2]=object.bounding_box,w=x2-x1,h=y2-y1;
  if(w<=0||h<=0)return;const scale=Math.min(96/w,80/h);
  ctx.fillStyle='#303333';ctx.fillRect(0,0,96,80);
  ctx.drawImage(s,x1,y1,w,h,(96-w*scale)/2,(80-h*scale)/2,w*scale,h*scale);
 });
</script>
<canvas bind:this={canvas} class="object-thumbnail" aria-label={`Analyzed ${object.object_name}`}></canvas>
