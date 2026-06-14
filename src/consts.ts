export const SITE = {
  title: 'Atharva',
  description:
    'Curious engineer in open source. Musings on software, philosophy, and the work of understanding.',
  url: 'https://www.atharvakanherkar.com',
  author: 'Atharva',
  twitter: '@attharrva15',
  github: 'https://github.com/Atharva-Kanherkar',
  medium: 'https://medium.com/@atharvakanherkar25',
  xArticles: 'https://x.com/attharrva15/articles',
  ogImage: '/og.jpg',
  ogImageAlt:
    'Atharva — profile photo. Software in the open. Philosophy in the long run.',
  ogImageWidth: 1200,
  ogImageHeight: 630,
} as const;

// Browser chrome color per theme. Mirrors --paper in src/styles/global.css.
// The inline no-flash script in BaseHead duplicates these literals (it cannot
// import a module); keep all three in sync if the paper tokens change.
export const THEME_COLOR = {
  light: '#fbfaf8',
  dark: '#131311',
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
