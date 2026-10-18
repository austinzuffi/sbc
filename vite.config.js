import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // keep the REACT_APP_ names so the existing .env and Netlify env vars still work
  envPrefix: 'REACT_APP_',
  server: {
    port: 3000,
  },
});
