
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
// Explicitly import process to provide correct Node.js types
import process from 'node:process';

export default defineConfig(({ mode }) => {
  // Carrega variáveis de ambiente (como API_KEY)
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY || ''),
      'process.env.SUPABASE_TOKEN': JSON.stringify('sbp_cba6b68afdced5f855b8096bfbc5fa1e24f3092a'),
      'process.env.NODE_ENV': JSON.stringify(mode),
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
