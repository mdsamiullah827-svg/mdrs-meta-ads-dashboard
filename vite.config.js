import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
  plugins: [react()],
  server: { allowedHosts: ['terminal.local'] },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (/recharts|d3-|victory-vendor/.test(id)) return 'charts';
            if (/html2canvas/.test(id)) return 'pdf-canvas';
            if (/jspdf|fflate|fast-png|iobuffer|pako|canvg|core-js|dompurify|rgbcolor|stackblur|raf|text-segmentation|utrie|base64-arraybuffer|css-line-break/.test(id)) return 'pdf-engine';
            return 'vendor';
          }
        }
      }
    }
  }
});
