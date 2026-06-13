# portfolio-site

A minimal, editorial personal site — static by default, SEO-ready, with a markdown blog.

## Stack

- [Astro](https://astro.build) — static site generation
- Markdown content collections for the blog
- Built-in sitemap, RSS, Open Graph, and JSON-LD

## Develop

```bash
npm install
npm run dev
```

Open [http://localhost:4321](http://localhost:4321).

## Build

```bash
npm run build
npm run preview
```

## Customize

Edit `src/consts.ts` with your name, URL, and social links. Add blog posts as markdown files in `src/content/blog/`.

## Deploy

Deploy the `dist/` folder to any static host (Vercel, Netlify, Cloudflare Pages, GitHub Pages). Set your production URL in `astro.config.mjs` and `src/consts.ts`.
