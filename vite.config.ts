
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// GitHub Pages와 Vercel 환경에 맞게 경로 설정
export default defineConfig({
  plugins: [react(), tailwindcss()],

  base: process.env.VERCEL
    ? '/'
    : '/green_point/',

  server: {
    port: 3000,
    host: '0.0.0.0',
  },
});
