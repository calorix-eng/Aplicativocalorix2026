
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Carrega variáveis de ambiente (como API_KEY)
  // FIX: Cast process to any to resolve "Property 'cwd' does not exist on type 'Process'" error in TypeScript environments with browser-focused types.
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    define: {
      // Polyfill robusto para process.env exigido pelo SDK da Gemini
      'process.env': {
        API_KEY: JSON.stringify(env.API_KEY || ''),
        NODE_ENV: JSON.stringify(mode),
      },
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
              if (id.includes('framer-motion')) {
                return 'vendor-motion';
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
  };
});
