<script lang="ts">
 import type { Snippet } from 'svelte';import { user, sessionReady } from '@lib/session';import { LockKeyhole, ArrowUpRight } from 'lucide-svelte';
 let {children}:{children:Snippet}=$props();
</script>
{#if !$sessionReady}<div class="loading-state" aria-live="polite">Loading your workspace…</div>{:else if !$user}<div class="protected-state"><LockKeyhole size={35}/><h1>Your personal workspace.</h1><p>Sign in to save detections, revisit your history, and explore your analytics.</p><div><a class="btn" href="/login">Sign in <ArrowUpRight size={17}/></a><a class="btn outline" href="/register">Create account</a></div><a class="text-link" href="/detect/live">Try live detection as a guest <ArrowUpRight size={16}/></a></div>{:else}{@render children()}{/if}
