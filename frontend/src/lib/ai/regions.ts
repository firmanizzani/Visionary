import {iou} from './math';
import type {DetectedObject} from '@lib/types';

const sceneObjects=new Set(['person','bus','car','truck','train','bicycle','motorcycle','airplane','boat']);
export const establishedClasses=sceneObjects;
type Match={object:DetectedObject;geometryMatch:boolean};
const area=(o:DetectedObject)=>{const [x1,y1,x2,y2]=o.bounding_box;return (x2-x1)*(y2-y1);};
function overlap(a:DetectedObject,b:DetectedObject){
 const x=a.bounding_box,y=b.bounding_box;
 return Math.max(0,Math.min(x[2],y[2])-Math.max(x[0],y[0]))*Math.max(0,Math.min(x[3],y[3])-Math.max(x[1],y[1]));
}

/** Merge competing proposals for one item; retain spatially separate instances. */
export function consolidateRegions(matches:Match[],related:(a:number,b:number)=>boolean):DetectedObject[]{
 const same=(a:DetectedObject,b:DetectedObject)=>a.class_id===b.class_id||related(a.class_id,b.class_id);
 // Small, contained proposals often describe a cap, buckle or support of the whole item.
 // Never discard an item simply because a person or vehicle encloses it.
 const candidates=matches.filter(({object:a})=>!matches.some(({object:b})=>
  a!==b&&!sceneObjects.has(b.object_name)&&!same(a,b)&&b.confidence>=.35&&
  area(a)<area(b)*.35&&overlap(a,b)/area(a)>.9));
 const groups=candidates.map((_,i)=>i);
 const root=(i:number):number=>groups[i]===i?i:root(groups[i]);
 for(let i=0;i<candidates.length;i++)for(let j=0;j<i;j++){
  const a=candidates[i].object,b=candidates[j].object;
  const bothGeometryMatch=candidates[i].geometryMatch&&candidates[j].geometryMatch;
  if(same(a,b)&&(iou(a.bounding_box,b.bounding_box)>(bothGeometryMatch ? .65 : .2)||(!bothGeometryMatch&&overlap(a,b)/Math.min(area(a),area(b))>.65)))groups[root(i)]=root(j);
 }
 const best=new Map<number,Match>();
 candidates.forEach((candidate,i)=>{
  const key=root(i),previous=best.get(key);
  const rank=(m:Match)=>Number(m.geometryMatch)*2+m.object.confidence;
  if(!previous||rank(candidate)>rank(previous))best.set(key,candidate);
 });
 return [...best.values()].map(m=>m.object).sort((a,b)=>b.confidence-a.confidence);
}
