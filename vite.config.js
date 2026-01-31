import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from 'url';
import { VitePWA } from 'vite-plugin-pwa';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'Meow OT Tracker',
        short_name: 'Meow OT',
        description: 'Track your OT with Meow power!',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      'iceberg-js': path.resolve(__dirname, './src/lib/mock-iceberg.js')
    }
  },
  build: {
    rollupOptions: {
      // external: ['iceberg-js'], // REMOVED: We want to bundle the mock!
    },
  },
  optimizeDeps: {
    // exclude: ['iceberg-js'], // REMOVED
  },
});
