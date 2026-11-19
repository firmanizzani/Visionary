<script lang="ts">
 import {Moon,Sun,Monitor} from 'lucide-svelte';
 import {theme} from '@lib/theme';
</script>
<label class="theme-switch">
 {#if $theme==='dark'}<Moon size={16}/>{:else if $theme==='light'}<Sun size={16}/>{:else}<Monitor size={16}/>{/if}
 <span class="visually-hidden">Color theme</span>
 <select aria-label="Color theme" bind:value={$theme}><option value="dark">Dark</option><option value="light">Light</option><option value="system">System</option></select>
</label>
