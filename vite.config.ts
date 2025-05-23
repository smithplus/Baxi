import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      plugins: [
        VitePWA({
          registerType: 'autoUpdate',
          includeAssets: ['Baxi.png'],
          manifest: {
            name: 'Calculadora de Tarifas de Taxi BA',
            short_name: 'Taxi BA',
            description: 'Calculadora de Tarifas de Taxi en Buenos Aires',
            theme_color: '#317EFB',
            background_color: '#ffffff',
            display: 'standalone',
            scope: '/',
            start_url: '/',
            icons: [
              {
                src: 'Baxi.png',
                sizes: '64x64 32x32 24x24 16x16',
                type: 'image/png'
              },
              {
                src: 'Baxi.png',
                type: 'image/png',
                sizes: '192x192'
              },
              {
                src: 'Baxi.png',
                type: 'image/png',
                sizes: '512x512'
              }
            ]
          }
        })
      ]
    };
});
