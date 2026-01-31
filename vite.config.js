import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'iceberg-js': '/src/lib/mock-iceberg.js'
    }
  },
  build: {
    rollupOptions: {
      external: ['iceberg-js'],
    },
  },
  optimizeDeps: {
    exclude: ['iceberg-js'],
  },
  build: {
    rollupOptions: {
      external: ['iceberg-js'],
    },
  },
  optimizeDeps: {
    exclude: ['iceberg-js'],
  },
});
