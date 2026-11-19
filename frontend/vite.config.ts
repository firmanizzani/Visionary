import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import adapter from '@sveltejs/adapter-vercel';
import node from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { fileURLToPath } from 'node:url';
export default defineConfig({ envPrefix: ["VITE_","PUBLIC_"], plugins: [tailwindcss(), sveltekit({adapter:process.env.VERCEL?adapter():node({precompress:false}),preprocess:vitePreprocess()})],resolve:{alias:{'@lib':fileURLToPath(new URL('./src/lib',import.meta.url))}}, server: { proxy: { '/api': 'http://127.0.0.1:8000' } },preview:{proxy:{'/api':'http://127.0.0.1:8000'}}, worker: { format: 'es' }, optimizeDeps: { exclude: ['onnxruntime-web'] } });

