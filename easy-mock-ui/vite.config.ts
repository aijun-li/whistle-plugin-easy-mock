import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';
import { Options, VitePWA } from 'vite-plugin-pwa';
import WindiCSS from 'vite-plugin-windicss';

const pwaOptions: Partial<Options> = {
  strategies: 'generateSW',
  registerType: 'autoUpdate',
  injectRegister: 'auto',
  includeAssets: ['favicon.ico', 'robots.txt'],
  manifest: {
    name: 'Easy Mock',
    short_name: 'Easy Mock',
    theme_color: '#ffffff',
    description: 'A simple whistle mock plugin',
    icons: [
      {
        src: 'pwa-48x48.png',
        sizes: '48x48',
        type: 'image/png',
      },
      {
        src: 'pwa-96x96.png',
        sizes: '96x96',
        type: 'image/png',
      },
      {
        src: 'pwa-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: 'pwa-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  },
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte(), WindiCSS(), VitePWA(pwaOptions)],
  build: {
    emptyOutDir: true,
    outDir: '../whistle.easy-mock/public',
  },
  base: '/whistle.easy-mock/',
});
