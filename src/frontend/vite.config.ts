import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import environment from 'vite-plugin-environment';

export default defineConfig({
  plugins: [
    react(),
    environment('all', { prefix: 'CANISTER_' }),
    environment('all', { prefix: 'DFX_' }),
    environment('all', { prefix: 'II_' }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:4943',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
