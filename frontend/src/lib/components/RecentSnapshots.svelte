<script lang="ts">
 import {user} from '@lib/session';import {api} from '@lib/api';
 import {ArrowUpRight,Bookmark} from 'lucide-svelte';import type {Detection} from '@lib/types';
 let {revision=0}=$props();let items=$state<Detection[]>([]),loading=$state(false);let generation=0;
 $effect(()=>{
  revision;const account=$user,run=++generation;items=[];loading=false;
  if(!account)return;loading=true;
  api('/detections?page=1').then(result=>{if(run===generation)items=result.items.slice(0,3);}).catch(()=>{}).finally(()=>{if(run===generation)loading=false;});
  return ()=>{generation++;};
 });
</script>
<section class="recent-snapshots panel">
 <div class="panel-heading"><h2>Recent snapshots</h2><a href={$user?'/history':'/login'} aria-label={$user?'View detection history':'Sign in to view history'}><ArrowUpRight size={17}/></a></div>
 {#if items.length}<div class="snapshot-strip">{#each items as item}<a href={`/history/${item.id}`}><img src={item.image_url} alt="Saved snapshot" loading="lazy"/><span>{item.total_objects} objects<small>{new Date(item.detected_at).toLocaleDateString()}</small></span></a>{/each}</div>
 {:else}<div class="snapshot-empty"><Bookmark size={22}/><div><strong>{loading?'Loading your snapshots...':'Keep the moments that matter.'}</strong><p>{$user?'Saved detections appear here.':'Sign in to save a snapshot and build your private collection.'}</p></div>{#if !$user}<a href="/login" class="text-link">Sign in <ArrowUpRight size={15}/></a>{/if}</div>{/if}
</section>
