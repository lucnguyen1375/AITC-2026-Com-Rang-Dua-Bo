import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { aiPlugin } from './server/ai.mjs';
export default defineConfig(({ mode }) => {
 const env = { ...loadEnv(mode, '../..', ''), ...loadEnv(mode, '.', ''), ...process.env };
 return {
  plugins: [react(), aiPlugin(env)],
  base: './',
  server: { host: '127.0.0.1', port: 5173, strictPort: true },
  preview: {
   host: '127.0.0.1',
   port: 5173,
   strictPort: true,
   allowedHosts: ['aitc-2026-com-rang-dua-bo.onrender.com'],
  },
 };
});
