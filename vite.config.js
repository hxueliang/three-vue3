import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import glsl from 'vite-plugin-glsl';
import requireTransform from 'vite-plugin-require-transform';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    hmr: true
  },
  plugins: [
    vue(),
    glsl(),
    requireTransform({
      fileRegex: /.js$|.vue$/
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
});
