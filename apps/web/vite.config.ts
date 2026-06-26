import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 4200,
    strictPort: true,
    proxy: {
      '/graphql': {
        target: 'http://127.0.0.1:4000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist/web/browser',
    emptyOutDir: true,
  },
});
