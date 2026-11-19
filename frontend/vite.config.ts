import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import adapter from '@sveltejs/adapter-vercel';
import node from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { fileURLToPath } from 'node:url';
const apiTarget = process.env.VISIONARY_API_TARGET || 'http://127.0.0.1:8001';
export default defineConfig({ envPrefix: ["VITE_","PUBLIC_"], plugins: [tailwindcss(), sveltekit({adapter:process.env.VERCEL?adapter():node({precompress:false}),preprocess:vitePreprocess()})],resolve:{alias:{'@lib':fileURLToPath(new URL('./src/lib',import.meta.url))}}, server: { port: 5173, strictPort: true, proxy: { '/api': apiTarget } },preview:{proxy:{'/api':apiTarget}}, worker: { format: 'es' }, optimizeDeps: { exclude: ['onnxruntime-web'] } });

