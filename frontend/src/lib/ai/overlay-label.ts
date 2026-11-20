// Keep the score readable without drawing long names beyond the image edge.
export function fitOverlayLabel(name:string,suffix:string,maxWidth:number,measure:(value:string)=>number):string {
 if(measure(name+suffix)<=maxWidth)return name+suffix;
 let ending='…'+suffix;
 if(measure(ending)>maxWidth)ending='…';
 if(measure(ending)>maxWidth)return '';
 const chars=Array.from(name);let low=0,high=chars.length;
 while(low<high){const mid=Math.ceil((low+high)/2);if(measure(chars.slice(0,mid).join('')+ending)<=maxWidth)low=mid;else high=mid-1;}
 return chars.slice(0,low).join('')+ending;
}
