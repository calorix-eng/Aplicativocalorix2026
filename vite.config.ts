
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Garante que referências a process.env no código (como no Gemini SDK)
    // funcionem no navegador sem causar ReferenceError.
    'process.env': {
      API_KEY: process.env.API_KEY
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    // Aumenta o limite de aviso de 500kb para 1000kb
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Estratégia de divisão de código para separar dependências grandes
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Separa o Firebase em um chunk próprio pois é muito grande
            if (id.includes('firebase')) {
              return 'vendor-firebase';
            }
            // Separa o SDK do Gemini
            if (id.includes('@google/genai')) {
              return 'vendor-gemini';
            }
            // Outras bibliotecas vão para um chunk vendor genérico
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
