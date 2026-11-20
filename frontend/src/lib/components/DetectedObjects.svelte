<script lang="ts">
 import {ChevronDown,ChevronUp} from 'lucide-svelte';
 let {objects}:{objects:{label:string;count:number}[]}=$props();
 let showAll=$state(false);
 let rankedObjects=$derived([...objects].sort((a,b)=>b.count-a.count||a.label.localeCompare(b.label)));
 let totalObjects=$derived(objects.reduce((total,object)=>total+object.count,0));
 let visibleObjects=$derived(showAll?rankedObjects:rankedObjects.slice(0,5));
 const number=new Intl.NumberFormat('en-US');
 const share=(count:number)=>totalObjects?count/totalObjects*100:0;
</script>

<section class="panel" aria-labelledby="detected-objects-title">
 <div class="panel-heading objects-heading">
  <h2 id="detected-objects-title">Detected objects</h2>
  <span>{number.format(objects.length)} {objects.length===1?'category':'categories'}</span>
 </div>
 <div class="panel-content objects-content">
  {#if objects.length}
   <table>
    <caption>{number.format(totalObjects)} objects · ranked by count</caption>
    <thead><tr><th scope="col">Category</th><th scope="col">Count</th><th scope="col">Percentage</th></tr></thead>
    <tbody id="detected-objects-rows">
     {#each visibleObjects as object (object.label)}
      <tr>
       <th scope="row">
        <span class="category-name">{object.label}</span>
        <span class="bar-track category-bar" aria-hidden="true"><span style:width={`${share(object.count)}%`}></span></span>
       </th>
       <td class="object-count">{number.format(object.count)}</td>
       <td class="object-share">{share(object.count).toFixed(1)}%</td>
      </tr>
     {/each}
    </tbody>
   </table>
   {#if objects.length>5}
    <div class="objects-footer">
     <span>Showing {visibleObjects.length} of {number.format(objects.length)}</span>
     <button class="objects-toggle" aria-expanded={showAll} aria-controls="detected-objects-rows" onclick={()=>showAll=!showAll}>
      {showAll?'Show top 5':`View all ${number.format(objects.length)}`}
      {#if showAll}<ChevronUp size={16}/>{:else}<ChevronDown size={16}/>{/if}
     </button>
    </div>
   {/if}
  {:else}
   <p class="inline-empty">Save a detection to see object counts and percentages.</p>
  {/if}
 </div>
</section>

<style>
 section{min-width:0}
 .objects-heading{flex-wrap:wrap;min-height:52px;padding-block:14px}
 .objects-content{padding-top:12px;padding-bottom:8px}
 table{width:100%;border-collapse:collapse;table-layout:fixed;font-size:14px}
 caption{text-align:left;color:var(--muted);font-size:12px;padding-bottom:12px}
 th,td{padding:0;text-align:left;border:0}
 thead th{font-size:12px;font-weight:500;color:var(--muted);padding-bottom:4px}
 thead th:not(:first-child),td{text-align:right;font-variant-numeric:tabular-nums}
 thead th:nth-child(2),.object-count{width:64px}
 thead th:nth-child(3),.object-share{width:94px}
 tbody th{padding:10px 24px 10px 0;font-weight:500}
 tbody tr+tr{border-top:1px solid var(--border)}
 .category-name{display:block;overflow-wrap:anywhere;line-height:1.5}
 .category-bar{display:block;margin-top:6px;height:4px}
 .category-bar>span{border-radius:inherit}
 .object-count{font-weight:650}
 .object-share{color:var(--muted)}
 .objects-footer{border-top:1px solid var(--border);padding-top:6px;display:flex;align-items:center;justify-content:space-between;gap:12px}
 .objects-footer>span{font-size:12px;color:var(--muted)}
 .objects-toggle{display:inline-flex;align-items:center;justify-content:center;gap:6px;min-height:44px;padding:8px 10px;border-radius:6px;background:transparent;color:var(--ink);font-size:13px;font-weight:600}
 .objects-toggle:hover{background:var(--raised)}
 .objects-toggle:focus-visible{outline-offset:2px}
 @media(max-width:480px){
  thead th:nth-child(2),.object-count{width:52px}
  thead th:nth-child(3),.object-share{width:84px}
  tbody th{padding-right:16px}
  .objects-footer{gap:8px}
  .objects-toggle{padding-inline:6px}
 }
</style>
