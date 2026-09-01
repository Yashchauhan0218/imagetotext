// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://imagemparatexto.com',
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: 'pt-BR',
        locales: {
          'pt-BR': 'pt-BR',
          'pt-PT': 'pt-PT',
          pt: 'pt'
        }
      }
    })
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
