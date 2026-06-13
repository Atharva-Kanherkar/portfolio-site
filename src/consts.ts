export const SITE = {
  title: 'Atharva',
  description:
    'Engineer building software and ML systems, deep in open source, working toward inclusive AI. Musings on philosophy, computing, and mathematics.',
  url: 'https://atharva.dev',
  author: 'Atharva',
  twitter: '@attharrva15',
  github: 'https://github.com/Atharva-Kanherkar',
  medium: 'https://medium.com/@atharvakanherkar25',
  xArticles: 'https://x.com/attharrva15/articles',
  ogImage: '/og.jpg',
  ogImageAlt: 'Atharva — engineer building software and ML systems in open source.',
  ogImageWidth: 1200,
  ogImageHeight: 630,
} as const;

export const WRITING_SECTIONS = [
  {
    id: 'vedanta',
    label: 'Philosophy',
    description: 'Indian philosophy, metaphysics, and related thought.',
  },
  {
    id: 'ai',
    label: 'Computing',
    description: 'AI, software, systems, and the craft of building.',
  },
  {
    id: 'math',
    label: 'Math',
    description: 'Notes on mathematics.',
  },
  {
    id: 'general',
    label: 'General',
    description: 'Everything else.',
  },
] as const;

export const WRITING_INTRO =
  'These are musings. I write mostly to think, not because I have much figured out. Notes in progress on philosophy, computing, math, and whatever else I am working through. I write on';

export type WritingSectionId = (typeof WRITING_SECTIONS)[number]['id'];
