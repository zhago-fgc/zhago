import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      // The core (Bun) is the source of truth for module manifests, the bus,
      // and every module's static frontend — the admin console never
      // duplicates that, it just proxies through in dev.
      '/api': 'http://localhost:3210',
      '/modules': 'http://localhost:3210',
    },
  },
});
