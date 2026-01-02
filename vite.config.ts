
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Polyfill do objeto process para compatibilidade total no navegador
    'process.env': process.env,
    'process.version': JSON.stringify('v18.0.0'),
    'process.platform': JSON.stringify('browser')
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('firebase')) {
              return 'vendor-firebase';
            }
            if (id.includes('@google/genai')) {
              return 'vendor-gemini';
            }
            return 'vendor';
          }
        }
      }
    }
  },
  server: {
    port: 3000
  }
});
