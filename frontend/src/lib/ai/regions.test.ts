import {describe,it,expect} from 'vitest';
import {consolidateRegions} from './regions';
import type {DetectedObject} from '@lib/types';
const region=(name:string,id:number,box:[number,number,number,number],confidence=.8,geometryMatch=false)=>({object:{object_name:name,class_id:id,bounding_box:box,confidence,segmentation_data:null} satisfies DetectedObject,geometryMatch});
describe('multiple object regions',()=>{
 it('keeps separate instances of the same category',()=>{
  expect(consolidateRegions([region('bottle',1,[0,0,30,80]),region('bottle',1,[60,0,90,80])],()=>false)).toHaveLength(2);
  expect(consolidateRegions([region('bottle',1,[0,0,100,100],.8,true),region('bottle',1,[50,0,150,100],.7,true)],()=>false)).toHaveLength(2);
 });
 it('merges overlapping synonym proposals and prefers corroborated geometry',()=>{
  const result=consolidateRegions([region('sunglasses',1,[0,0,100,50],.9),region('spectacles',2,[10,5,90,45],.7,true)],()=>true);
  expect(result).toHaveLength(1);expect(result[0].bounding_box).toEqual([10,5,90,45]);
 });
 it('suppresses contained component proposals while keeping objects held by a person',()=>{
  const result=consolidateRegions([region('perfume bottle',1,[0,0,100,200]),region('canister',2,[35,0,65,35]),region('person',3,[200,0,400,400],.99),region('wallet',4,[250,100,290,130])],()=>false);
  expect(result.map(o=>o.object_name)).toEqual(['person','perfume bottle','wallet']);
 });
 it('merges a connected set of partial proposals only once',()=>{
  expect(consolidateRegions([region('bottle',1,[0,0,100,100]),region('bottle',1,[0,60,100,160]),region('bottle',1,[0,120,100,220])],()=>false)).toHaveLength(1);
 });
});
