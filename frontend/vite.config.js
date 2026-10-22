import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite configuration with proxy so `/api` calls go directly to Node/Express on port 5000
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
});
