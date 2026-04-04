import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import legacy from '@vitejs/plugin-legacy'

export default defineConfig({
  base: './',
  plugins: [
    react(),
    tailwindcss(),
    legacy({
      targets: ['defaults', 'not IE 11'],
    }),
  ],
  build: {
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-i18next', 'i18next'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-capacitor': ['@capacitor/core', '@capacitor/preferences'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
})
