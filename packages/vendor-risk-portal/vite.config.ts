import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      app: path.resolve(__dirname, '../app/src'),
      shared: path.resolve(__dirname, '../shared/src'),
    },
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
  build: {
    outDir: 'dist',
    target: 'es2020',
    reportCompressedSize: false,
    rollupOptions: {
      input: path.resolve(__dirname, 'index.html'),
      output: {
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        manualChunks: (id) => {
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/') || id.includes('node_modules/react-router-dom/')) {
            return 'react-core';
          }

          if (id.includes('node_modules/@supabase')) {
            return 'supabase';
          }

          if (id.includes('node_modules/jspdf')) {
            return 'pdf-core';
          }

          if (id.includes('node_modules/html2canvas')) {
            return 'pdf-html-render';
          }

          if (id.includes('node_modules/mammoth')) {
            return 'docx-parser';
          }

          if (id.includes('node_modules/dompurify')) {
            return 'sanitization';
          }

          if (id.includes('node_modules/lucide-react') || id.includes('node_modules/i18next') || id.includes('node_modules/react-i18next')) {
            return 'ui-runtime';
          }
        },
      },
    },
  },
  server: {
    port: 5174,
    strictPort: false,
  },
  preview: {
    port: 4174,
    strictPort: true,
  },
});
