// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  define: {
    global: 'globalThis',
  },
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://192.168.31.177:8080', changeOrigin: true },
      '/ws': { target: 'ws://192.168.31.177:8080', ws: true },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          charts: ['recharts'],
          stomp: ['@stomp/stompjs', 'sockjs-client'],
        },
      },
    },
  },
});