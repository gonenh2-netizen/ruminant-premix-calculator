import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

/**
 * Vite config that builds the app into a single self-contained HTML file.
 * Output: dist/index.html — rename to Ruminant_Premix_Calculator.html for distribution.
 */
export default defineConfig({
  plugins: [react(), viteSingleFile()],
  build: {
    outDir: 'dist',
    assetsInlineLimit: 100000000,
    cssCodeSplit: false,
    rollupOptions: {
      output: { inlineDynamicImports: true },
    },
    chunkSizeWarningLimit: 2000,
  },
});
