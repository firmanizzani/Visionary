<script lang="ts">
 import { decodeRle } from '@lib/ai/math';
 import { fitOverlayLabel } from '@lib/ai/overlay-label';
 import type { DetectedObject, Mode } from '@lib/types';
 let {objects, width, height, mode='both', threshold=.5, showConfidence=true}: {objects:DetectedObject[];width:number;height:number;mode?:Mode;threshold?:number;showConfidence?:boolean}=$props();
 let canvas=$state<HTMLCanvasElement>(),displayWidth=$state(0);
 const colors=['#06b6d4','#3b82f6','#f59e0b','#10b981'];
 $effect(()=>{
  if(!canvas)return;const c=canvas;
  const observer=new ResizeObserver(()=>displayWidth=c.getBoundingClientRect().width);
  observer.observe(c);return ()=>observer.disconnect();
 });
 $effect(()=>{
  const c=canvas;if(!c||!width||!height)return;c.width=width;c.height=height;const ctx=c.getContext('2d')!;
  const visible=objects.filter(o=>o.confidence>=threshold);
  for(const o of visible){const color=colors[o.class_id%4];const [x1,y1,x2,y2]=o.bounding_box;
   if(mode!=='box'&&o.segmentation_data){const m=o.segmentation_data;const tmp=document.createElement('canvas');tmp.width=m.width;tmp.height=m.height;const tc=tmp.getContext('2d')!;const im=tc.createImageData(m.width,m.height),bits=decodeRle(m.rle,m.width*m.height),rgb=color.match(/\w\w/g)!.map(v=>parseInt(v,16));
    for(let i=0;i<bits.length;i++)if(bits[i]){im.data[i*4]=rgb[0];im.data[i*4+1]=rgb[1];im.data[i*4+2]=rgb[2];im.data[i*4+3]=85;}tc.putImageData(im,0,0);ctx.drawImage(tmp,0,0,width,height);
   }
   const displayScale=displayWidth?width/displayWidth:1;
   if(mode!=='mask'||!o.segmentation_data){ctx.strokeStyle=color;ctx.lineWidth=Math.max(2,width/500,1.5*displayScale);ctx.strokeRect(x1,y1,x2-x1,y2-y1);}
   const fs=Math.max(14,width/60,12*displayScale);ctx.font=`600 ${fs}px sans-serif`;
   const suffix=(o.label_margin!=null&&o.label_margin<.01?' ?':'')+(showConfidence?` ${Math.round(o.confidence*100)}%`:''),text=fitOverlayLabel(o.object_name,suffix,Math.max(0,width-12),value=>ctx.measureText(value).width),tw=Math.min(width,ctx.measureText(text).width+12),tx=Math.max(0,Math.min(x1,width-tw)),ty=Math.max(fs+10,y1);
   ctx.fillStyle=color;ctx.fillRect(tx,ty-fs-10,tw,fs+10);ctx.fillStyle='#071923';ctx.fillText(text,tx+6,ty-5);
  }
 });
</script>
<canvas bind:this={canvas} class="detection-overlay" aria-label={`${objects.filter(o=>o.confidence>=threshold).length} detected objects`}></canvas>
