import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // The API runs as a separate process in development. Proxying it here
    // keeps the frontend on one origin, so relative /api paths work and the
    // session cookie is not a cross-site cookie.
    proxy: {
      '/api': { target: 'http://localhost:3000', changeOrigin: true },
      '/uploads': { target: 'http://localhost:3000', changeOrigin: true },
    },
  },
  build: {
    target: 'es2019',
    cssCodeSplit: true,
  },
});
