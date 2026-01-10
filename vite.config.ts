import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
mode === 'production' && {
  name: 'copy-sw',
  closeBundle() {
    const fs = require('fs');
    const path = require('path');
    fs.copyFileSync(
      path.resolve(__dirname, 'public/sw.js'),
      path.resolve(__dirname, 'dist/sw.js')
    );
  }
}

  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
    exclude: [],
  },
}));
