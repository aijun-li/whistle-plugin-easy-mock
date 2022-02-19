import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import WindiCSS from 'vite-plugin-windicss';
import { viteOptimizeDeps } from 'svelte-jsoneditor/config';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte(), WindiCSS()],
  optimizeDeps: {
    include: [...viteOptimizeDeps],
  },
  build: {
    emptyOutDir: true,
    outDir: '../whistle.easy-mock/public',
  },
});
