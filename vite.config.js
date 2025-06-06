import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/ice-pc/', // Ensure this matches your repository name
  server: {
    port: 3000,
  },
});