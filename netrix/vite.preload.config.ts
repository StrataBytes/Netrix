import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  mode: 'development',
  build: {
    lib: {
      entry: resolve(__dirname, 'src/preload/preload.ts'),
      name: 'preload',
      fileName: 'preload',
      formats: ['cjs']
    },
    outDir: 'dist/preload',
    emptyOutDir: true,
    rollupOptions: {
      external: ['electron'],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
