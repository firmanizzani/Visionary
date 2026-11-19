<script lang="ts">
 import type { Snippet } from 'svelte';
 import { onMount } from 'svelte';
 import type { HTMLButtonAttributes } from 'svelte/elements';
 import { cn } from '@lib/utils';
 let { children, variant = 'default', class: className, ...rest }: HTMLButtonAttributes & { children?: Snippet; variant?: 'default' | 'outline' | 'ghost' | 'destructive' } = $props();
 let mounted=$state(false);onMount(()=>{mounted=true;});
</script>
<button class={cn('btn', variant !== 'default' && variant, className)} {...rest} disabled={!mounted||rest.disabled}>{@render children?.()}</button>
