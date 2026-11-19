<script lang="ts">
 import {Moon,Sun} from 'lucide-svelte';
 import {theme} from '@lib/theme';
 let action=$derived($theme==='dark'?'Switch to light mode':'Switch to dark mode');
</script>
<div class="theme-switch"><button type="button" class="theme-toggle" aria-label={action} title={action} onclick={()=>theme.set($theme==='dark'?'light':'dark')}>
 {#if $theme==='dark'}<Moon size={19}/>{:else}<Sun size={19}/>{/if}
</button></div>
