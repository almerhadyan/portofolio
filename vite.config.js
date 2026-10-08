import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3000,
    host: '0.0.0.0',
    hmr: process.env.DISABLE_HMR !== 'true',
    watch: process.env.DISABLE_HMR === 'true' ? null : {},
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        foodDelivery: resolve(import.meta.dirname, 'projects/food-delivery.html'),
        potrofolio: resolve(import.meta.dirname, 'projects/potrofolio.html'),
        brandSpaceLogo: resolve(import.meta.dirname, 'projects/brand-space-logo.html'),
        aiChatbot: resolve(import.meta.dirname, 'projects/ai-chatbot.html'),
        foodAppNm: resolve(import.meta.dirname, 'projects/food-app-nm.html'),
      },
    },
  },
});
