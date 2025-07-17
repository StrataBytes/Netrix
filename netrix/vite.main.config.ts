import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  mode: 'development',
  build: {
    lib: {
      entry: resolve(__dirname, 'src/main/main.ts'),
      name: 'main',
      fileName: 'main',
      formats: ['cjs']
    },
    outDir: 'dist/main',
    emptyOutDir: true,
    rollupOptions: {
      external: [
        'electron', 
        'path',
        'fs',
        'fs-extra',
        'axios',
        'util',
        'assert',
        'constants',
        'stream',
        'worker_threads',
        'os'
      ],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
