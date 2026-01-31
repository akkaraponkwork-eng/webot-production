import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'iceberg-js': path.resolve(__dirname, './src/lib/mock-iceberg.js')
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
});
