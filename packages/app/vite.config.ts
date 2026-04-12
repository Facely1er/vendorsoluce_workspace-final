import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables using Vite's loadEnv
  // Use process.cwd() as fallback, but prefer __dirname for reliability
  const root = __dirname;
  const env = loadEnv(mode, root, '');
  
  // Determine if this is a demo build
  const isDemoBuild =
    env.VITE_APP_ENV === 'demo' || env.BUILD_MODE === 'demo' || mode === 'demo';

  // Enterprise (license) build: no Stripe, output to dist-enterprise
  const isEnterpriseBuild =
    env.VITE_LICENSE_MODE === 'true' || mode === 'enterprise';

  // Guard: never allow demo mode in a production build
  if ((env.VITE_DEMO_MODE === 'true') && (mode === 'production' || env.NODE_ENV === 'production')) {
    throw new Error(
      '[VendorSoluce] VITE_DEMO_MODE must not be "true" in a production build. ' +
      'Unset VITE_DEMO_MODE or set it to "false" before building for production.'
    );
  }

  // Get base path from environment or default to root
  // This is critical for dynamic imports to work correctly
  const base = env.VITE_BASE_PATH || '/';

  return {
  base,
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
    include: ['react', 'react-dom', 'react-router-dom', 'recharts'],
  },
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  build: {
    // Use separate output directory for demo or enterprise builds
    outDir: isEnterpriseBuild ? 'dist-enterprise' : isDemoBuild ? 'dist-demo' : 'dist',
    target: 'es2020',
    minify: 'esbuild', // Use terser for production builds with better compression
    // Cast needed: Vite's TerserOptions type can disagree with terser's actual API (e.g. compress.drop_console)
    terserOptions: {
      compress: {
        drop_console: isDemoBuild ? false : true, // Keep console logs in demo for debugging
        drop_debugger: true,
      },
    } as import('vite').UserConfig['build'] extends { terserOptions?: infer T } ? T : never,
    // Ensure proper asset path resolution for dynamic imports
    assetsDir: 'assets',
    // Use relative paths for better compatibility
    assetsInlineLimit: 4096,
    rollupOptions: {
      output: {
        // Ensure consistent chunk file naming
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        manualChunks: (id) => {
          // Core React - must be loaded first
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/') || id.includes('node_modules/react-router-dom/') || id.includes('node_modules/react-is/')) {
            return 'react-core';
          }

          // Do NOT put recharts in a separate chunk: it needs the same React instance
          // as the app. Splitting it caused "Cannot read properties of undefined (reading 'forwardRef')"
          // because the charts chunk could run without React in scope.

          // React-dependent libraries
          if (id.includes('node_modules/@sentry/react') || 
              id.includes('node_modules/react-joyride')) {
            return 'react-plugins';
          }

          // Backend services
          if (id.includes('node_modules/@supabase')) {
            return 'supabase';
          }

          // PDF/export subsystem split into smaller on-demand chunks
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

          // Internationalization
          if (id.includes('node_modules/i18next') || id.includes('node_modules/react-i18next')) {
            return 'i18n';
          }

          // State management
          if (id.includes('node_modules/zustand')) {
            return 'state';
          }

          // UI utilities
          if (id.includes('node_modules/lucide-react') || id.includes('node_modules/date-fns')) {
            return 'ui-utils';
          }
        },
      },
      input: {
        main: '/index.html'
      }
    },
    sourcemap: isDemoBuild ? true : false, // Include sourcemaps in demo for debugging
    reportCompressedSize: false,
  },
  server: {
    port: 5175,
    strictPort: false,
  },
  preview: {
    port: 4173,
    strictPort: true,
  }
  };
});