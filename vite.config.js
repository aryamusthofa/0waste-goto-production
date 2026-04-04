import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import legacy from '@vitejs/plugin-legacy'
import { resolve } from 'path'

export default defineConfig({
  base: './',
  
  plugins: [
    react({
      jsxRuntime: 'automatic',
      babel: {
        cacheDirectory: true,
      },
    }),
    tailwindcss(),
    legacy({
      targets: ['defaults', 'not IE 11'],
      renderLegacyChunks: false,
      modernPolyfills: true,
    }),
  ],

  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },

  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: false,
    cors: true,
  },

  preview: {
    host: '0.0.0.0',
    port: 4173,
    strictPort: false,
  },

  build: {
    target: 'esnext',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info'],
      },
      mangle: {
        safari10: true,
      },
      output: {
        comments: false,
      },
    },

    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-i18next', 'i18next'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-capacitor': [
            '@capacitor/core',
            '@capacitor/preferences',
            '@capacitor/splash-screen',
            '@capacitor/status-bar',
          ],
          'vendor-ui': ['html2canvas', 'jspdf'],
        },
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: ({ name }) => {
          if (/\.(gif|jpe?g|png|svg|webp)$/.test(name ?? '')) {
            return 'assets/images/[name]-[hash][extname]'
          } else if (/\.css$/.test(name ?? '')) {
            return 'assets/styles/[name]-[hash][extname]'
          }
          return 'assets/[name]-[hash][extname]'
        },
      },
    },

    chunkSizeWarningLimit: 1000,
    cssCodeSplit: true,
    reportCompressedSize: true,
    emptyOutDir: true,
  },

  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
  },

  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
  },

  ssr: {
    noExternal: ['@capacitor/core', '@capacitor/preferences'],
  },
})
