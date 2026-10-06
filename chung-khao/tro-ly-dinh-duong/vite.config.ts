import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
 plugins: [react()],
 base: './',
 preview: {
  allowedHosts: ['aitc-2026-com-rang-dua-bo.onrender.com'],
  proxy: {'/api': {target:'http://127.0.0.1:3000', changeOrigin:false}},
 },
 server: {
  proxy: {
   '/api': {
    target: 'http://127.0.0.1:3000',
    changeOrigin: false,
   },
  },
 },
});
