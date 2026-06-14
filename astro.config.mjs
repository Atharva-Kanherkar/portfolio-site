// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://atharva.dev',
  output: 'server',
  adapter: vercel(),
  integrations: [sitemap()],
  fonts: [
    {
      name: 'Geist',
      cssVariable: '--font-sans',
      provider: fontProviders.google(),
      weights: [400, 500, 600],
      // Geist ships no true italic; the browser synthesizes oblique for <em>.
      // Declaring normal-only avoids preloading unused italic faces.
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
    },
    {
      name: 'Geist Mono',
      cssVariable: '--font-mono',
      provider: fontProviders.google(),
      weights: [400],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
    },
  ],
  markdown: {
    // Achromatic by design: render code as plain, theme-aware monospace
    // (styled by .prose pre/code tokens) instead of colored syntax highlighting.
    syntaxHighlight: false,
  },
});
