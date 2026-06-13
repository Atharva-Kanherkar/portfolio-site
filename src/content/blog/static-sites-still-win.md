---
title: 'Static sites still win'
description: 'Why a mostly-static personal site remains the best default for developers who care about speed, SEO, and sanity.'
section: general
pubDate: 2026-05-18
tags: ['web', 'seo']
---

There is a moment in every side project where someone suggests "just use a CMS."

Sometimes that is correct. Often it is procrastination dressed up as architecture.

For a personal portfolio and blog, static generation is still the best default.

## Speed is a feature

Core Web Vitals are not vanity metrics. Google uses page experience signals. Humans use patience — or lack of it.

A static HTML file served from the edge loads before a visitor has time to question whether they clicked the right link.

## SEO loves clarity

Search engines reward:

- Semantic HTML with a single clear `<h1>`
- Descriptive meta tags and Open Graph data
- Fast pages with stable layout
- A sitemap and RSS feed that do not require authentication

You can bolt these onto a dynamic app. It is easier when the output is just files.

## The maintenance budget

Dynamic stacks need:

- Database backups
- Dependency updates
- Patch Tuesday anxiety

Markdown in git needs:

- A text editor
- A deploy hook

That asymmetry matters when the site is not your day job.

## When to add dynamism

Reach for a server when you genuinely need:

- Comments with moderation
- A newsletter signup tied to your ESP
- Authenticated admin for non-technical collaborators

Until then, ship HTML.

This site follows that rule. Astro compiles content to static files. The blog is markdown. The design is CSS. The novelty is in the restraint.
