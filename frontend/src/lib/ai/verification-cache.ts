import {iou} from './math';
import type {DetectedObject} from '@lib/types';

type Label=Pick<DetectedObject,'class_id'|'object_name'|'label_similarity'|'label_margin'>;
type Entry={box:number[];proposal:number;pixels:Uint8Array;label:Label|null;time:number;uses:number};

// Reuse labels only for spatially and visually stable live regions. Geometry,
// confidence and masks always come from the CURRENT detector frame.
export class VerificationCache{
 private entries:Entry[]=[];
 clear(){this.entries=[];}
 get(object:DetectedObject,pixels:Uint8Array,now:number):{label:Label|null}|null{
  this.entries=this.entries.filter(entry=>now-entry.time<10000&&entry.uses<3);
  for(const entry of this.entries){
   if(entry.proposal!==object.class_id||entry.pixels.length!==pixels.length||iou(entry.box,object.bounding_box)<.75)continue;
   let difference=0;for(let i=0;i<pixels.length;i++)difference+=Math.abs(pixels[i]-entry.pixels[i]);
   if(difference/pixels.length>8)continue;
   entry.uses++;return {label:entry.label?{...entry.label}:null};
  }
  return null;
 }
 put(proposal:DetectedObject,pixels:Uint8Array,result:DetectedObject|null,now:number){
  this.entries.unshift({box:[...proposal.bounding_box],proposal:proposal.class_id,pixels:pixels.slice(),label:result?{class_id:result.class_id,object_name:result.object_name,label_similarity:result.label_similarity,label_margin:result.label_margin}:null,time:now,uses:0});
  this.entries.length=Math.min(this.entries.length,64);
 }
}
