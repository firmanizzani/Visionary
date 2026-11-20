import {describe,it,expect} from 'vitest';
import {VerificationCache} from './verification-cache';
import type {DetectedObject} from '@lib/types';
const proposal:DetectedObject={class_id:1,object_name:'bottle',confidence:.6,bounding_box:[0,0,100,100],segmentation_data:null};
const result={...proposal,class_id:2,object_name:'perfume bottle',label_similarity:.35,label_margin:.02};
const pixels=new Uint8Array(16*16*3).fill(100);
describe('live label reuse',()=>{
 it('reuses only the label, keeping current frame confidence and geometry independent',()=>{
  const cache=new VerificationCache();cache.put(proposal,pixels,result,0);
  const label=cache.get({...proposal,confidence:.52,bounding_box:[2,2,102,102]},pixels,1000)?.label;
  expect(label?.object_name).toBe('perfume bottle');expect(label).not.toHaveProperty('confidence');expect(label).not.toHaveProperty('bounding_box');expect(label).not.toHaveProperty('segmentation_data');
 });
 it('briefly reuses rejected background regions without mistaking a miss for a rejection',()=>{
  const cache=new VerificationCache();cache.put(proposal,pixels,null,0);
  expect(cache.get(proposal,pixels,100)).toEqual({label:null});
  expect(cache.get(proposal,new Uint8Array(pixels.length).fill(150),101)).toBeNull();
 });
 it('rejects movement, visual changes, a different proposal class, and expired labels',()=>{
  const cache=new VerificationCache();cache.put(proposal,pixels,result,0);
  expect(cache.get({...proposal,bounding_box:[100,100,200,200]},pixels,100)).toBeNull();
  expect(cache.get(proposal,new Uint8Array(pixels.length).fill(130),100)).toBeNull();
  expect(cache.get({...proposal,class_id:3},pixels,100)).toBeNull();
  expect(cache.get(proposal,pixels,10000)).toBeNull();
 });
 it('forces re-verification after three reuses and clears when the camera session changes',()=>{
  const cache=new VerificationCache();cache.put(proposal,pixels,result,0);
  for(let i=0;i<3;i++)expect(cache.get(proposal,pixels,100+i)).not.toBeNull();
  expect(cache.get(proposal,pixels,104)).toBeNull();
  cache.put(proposal,pixels,result,105);cache.clear();expect(cache.get(proposal,pixels,106)).toBeNull();
 });
});
