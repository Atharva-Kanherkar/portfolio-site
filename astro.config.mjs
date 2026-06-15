// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

export default defineConfig({
  site: 'https://www.atharvakanherkar.com',
  output: 'server',
  // maxDuration is global in @astrojs/vercel (per-route export is ignored); AI
  // streaming + image generation need headroom (enable Fluid Compute on Vercel too).
  adapter: vercel({ maxDuration: 60 }),
  integrations: [
    // Keep the private studio out of the public sitemap.
    sitemap({ filter: (page) => !page.includes('/studio') }),
    // React powers the studio editor island only; inert on pages with no island.
    react(),
  ],
  // Prefetch internal links on hover so plain (non-SPA) navigation feels instant.
  prefetch: { prefetchAll: true },
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
    // Math: $...$ / $$...$$ render via KaTeX. The legacy top-level array form
    // preserves Astro's GFM + SmartyPants defaults (the processor form wouldn't).
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
  },
});
