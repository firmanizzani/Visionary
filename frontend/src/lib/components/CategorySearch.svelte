<script lang="ts">
 import {Search} from 'lucide-svelte';
 let {query=$bindable(''),matches}:{query?:string;matches:string[]}=$props();
 let open=$state(false),active=$state(-1),container=$state<HTMLDivElement>();
 const popular=['wallet','sunglasses','perfume bottle','book','chair','cell phone'];
 let suggestions=$derived(query.trim()?matches.slice(0,6):popular.filter(name=>matches.includes(name)));
 let showing=$derived(open&&suggestions.length>0);
 function choose(value:string){query=value;open=false;active=-1;}
 function keydown(event:KeyboardEvent){
  if(event.key==='Escape'&&open){event.preventDefault();open=false;active=-1;}
  else if(event.key==='ArrowDown'||event.key==='ArrowUp'){
   event.preventDefault();open=true;
   if(suggestions.length)active=(active+(event.key==='ArrowDown'?1:active<0?0:-1)+suggestions.length)%suggestions.length;
  }else if(event.key==='Enter'&&showing&&active>=0){event.preventDefault();choose(suggestions[active]);}
 }
 function outside(event:PointerEvent){if(container&&!container.contains(event.target as Node)){open=false;active=-1;}}
</script>
<svelte:window onpointerdown={outside}/>
<div class="category-search" bind:this={container}>
 <label for="category-search">Search categories</label>
 <div class="category-input"><Search size={18} aria-hidden="true"/><input id="category-search" type="search" role="combobox" autocomplete="off" spellcheck="false" bind:value={query} placeholder="Try wallet, lamp, or sunglasses…" aria-describedby="category-help" aria-autocomplete="list" aria-expanded={showing} aria-controls="category-suggestions" aria-activedescendant={showing&&active>=0?`category-option-${active}`:undefined} onfocus={()=>{open=true;active=-1;}} oninput={()=>{open=true;active=-1;}} onkeydown={keydown} onblur={event=>{if(!container?.contains(event.relatedTarget as Node)){open=false;active=-1;}}}/></div>
 {#if showing}<div class="suggestion-popup"><p>{query.trim()?'Suggested categories':'Popular categories'}</p><div id="category-suggestions" role="listbox" aria-label="Category suggestions">{#each suggestions as item,index}<button type="button" id={`category-option-${index}`} role="option" aria-selected={active===index} tabindex="-1" onpointerdown={event=>event.preventDefault()} onclick={()=>choose(item)}><Search size={15} aria-hidden="true"/>{item}</button>{/each}</div></div>{/if}
</div>

<style>
 .category-search{position:relative}.category-search>label{margin-bottom:9px;font-size:14px}
 .category-input{display:flex;align-items:center;gap:12px;border:1px solid var(--border);background:var(--surface);border-radius:8px;padding:0 14px}.category-input :global(svg){color:var(--muted);flex-shrink:0}.category-input:focus-within{outline:2px solid var(--accent);outline-offset:3px}.category-input>input{flex:1;min-width:0;width:100%;height:48px;padding:0;border:0;background:transparent}.category-input>input:focus-visible{outline:none}
 .suggestion-popup{position:absolute;top:calc(100% + 8px);left:0;right:0;z-index:20;max-height:min(340px,50dvh);overflow:auto;overscroll-behavior:contain;border:1px solid var(--border);border-radius:10px;background:var(--surface);padding:8px;box-shadow:0 10px 28px var(--scrim)}
 .suggestion-popup>p{font-size:13px;color:var(--muted);padding:6px 10px 8px;line-height:1.5}
 [role=option]{display:flex;align-items:center;gap:10px;width:100%;min-height:44px;padding:10px;border-radius:6px;background:transparent;color:var(--ink);font-size:14px;text-align:left;overflow-wrap:anywhere}
 [role=option] :global(svg){flex-shrink:0;color:var(--muted)}[role=option]:hover,[role=option][aria-selected=true]{background:var(--accent-soft);color:var(--accent)}
 @media(max-width:600px){.category-input>input{font-size:16px}}
</style>
