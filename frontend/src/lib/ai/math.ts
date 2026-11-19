import { LABELS } from './labels';
import type { DetectedObject } from '@lib/types';
export function letterbox(width: number, height: number, size = 640) {
 const scale = Math.min(size / width, size / height);
 const resizedWidth = Math.round(width * scale), resizedHeight = Math.round(height * scale);
 return {scale, padX: Math.floor((size - resizedWidth) / 2), padY: Math.floor((size - resizedHeight) / 2), resizedWidth, resizedHeight};
}
export function iou(a: number[], b: number[]) {
 const area = Math.max(0, Math.min(a[2],b[2])-Math.max(a[0],b[0])) * Math.max(0,Math.min(a[3],b[3])-Math.max(a[1],b[1]));
 return area / Math.max(1e-8,(a[2]-a[0])*(a[3]-a[1])+(b[2]-b[0])*(b[3]-b[1])-area);
}
export function countObjects(objects: DetectedObject[], threshold: number) {
 return objects.filter(o=>o.confidence>=threshold).reduce((a,o)=>({...a,[o.object_name]:(a[o.object_name]||0)+1}),{} as Record<string,number>);
}
export function encodeRle(mask: Uint8Array) {
 const runs: number[] = []; let last=0, count=0;
 for(const value of mask) { if(value===last) count++; else {runs.push(count); count=1; last=value;} } runs.push(count); return runs;
}
export function decodeRle(runs: number[], length: number) {
 const mask=new Uint8Array(length); let offset=0, value=0;
 for(const count of runs) {if(value) mask.fill(1,offset,Math.min(length,offset+count)); offset+=count; value=1-value;} return mask;
}
// Contract: YOLOv8n-seg, static 640, no embedded NMS: [1,116,8400] and [1,32,160,160].
export function decode(pred: Float32Array, dims: readonly number[], proto: Float32Array, pdims: readonly number[], width: number, height: number, threshold=.1): DetectedObject[] {
 if(dims.length!==3 || dims[1]!==116 || pdims.length!==4 || pdims[1]!==32 || pdims[2]!==160 || pdims[3]!==160) throw new Error('Model outputs do not match YOLOv8 segmentation v1. Export the documented model.');
 const n=dims[2], {scale,padX,padY}=letterbox(width,height);
 const candidates: {index:number; cls:number; score:number; box:[number,number,number,number]}[]=[];
 for(let i=0;i<n;i++) {
  let cls=0,score=0; for(let c=0;c<80;c++) { const v=pred[(4+c)*n+i]; if(v>score){score=v;cls=c;} }
  if(score<threshold) continue;
  const x=pred[i], y=pred[n+i], w=pred[2*n+i], h=pred[3*n+i];
  const box:[number,number,number,number]=[Math.max(0,(x-w/2-padX)/scale),Math.max(0,(y-h/2-padY)/scale),Math.min(width,(x+w/2-padX)/scale),Math.min(height,(y+h/2-padY)/scale)];
  if(box[2]>box[0] && box[3]>box[1]) candidates.push({index:i,cls,score,box});
 }
 candidates.sort((a,b)=>b.score-a.score);
 const kept: typeof candidates=[];
 for(const c of candidates.slice(0,3000)){ if(!kept.some(k=>k.cls===c.cls && iou(k.box,c.box)>.45)) kept.push(c); if(kept.length>=100) break; }
 return kept.map(c=>{
  // 160px masks in original-image aspect ratio, RLE keeps history bounded.
  const mw=Math.max(1,Math.round(width*scale/4)), mh=Math.max(1,Math.round(height*scale/4));
  const mask=new Uint8Array(mw*mh);
  for(let y=0;y<mh;y++) for(let x=0;x<mw;x++) {
   const ox=(x+.5)*width/mw, oy=(y+.5)*height/mh;
   if(ox<c.box[0]||ox>c.box[2]||oy<c.box[1]||oy>c.box[3]) continue;
   const px=Math.min(159,Math.floor((ox*scale+padX)/4)),py=Math.min(159,Math.floor((oy*scale+padY)/4));
   let v=0; for(let k=0;k<32;k++) v+=pred[(84+k)*n+c.index]*proto[k*25600+py*160+px];
   mask[y*mw+x]=v>0?1:0;
  }
  return {class_id:c.cls,object_name:LABELS[c.cls],confidence:c.score,bounding_box:c.box,segmentation_data:{width:mw,height:mh,rle:encodeRle(mask)}};
 });
}
