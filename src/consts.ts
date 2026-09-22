export const SITE = {
  title: 'Atharva',
  description:
    'Curious engineer in open source. Musings on software, philosophy, and the work of understanding.',
  url: 'https://www.atharvakanherkar.com',
  author: 'Atharva',
  twitter: '@attharrva15',
  github: 'https://github.com/Atharva-Kanherkar',
  githubMergedPrs:
    'https://github.com/search?q=is%3Apr+is%3Amerged+author%3AAtharva-Kanherkar&type=pullrequests',
  medium: 'https://medium.com/@atharvakanherkar25',
  xArticles: 'https://x.com/attharrva15/articles',
  ogImage: '/og.jpg',
  ogImageAlt:
    'Atharva. Software in the open. Philosophy in the long run.',
  ogImageWidth: 1200,
  ogImageHeight: 630,
} as const;

export const BIO =
  "I'm 22, a curious engineer who builds software and ML systems and spends most of my time in open source, working toward more inclusive AI. Away from the terminal, my intellectual roots run through Advaita Vedanta and Indian philosophy.";

export const PROJECTS_INTRO =
  "Stupid, curious engineer. I build things because they seem worth building. Sometimes they aren't, and that's just how it goes.";

export const OPEN_SOURCE_NOTE =
  "Most of what I merge upstream right now are LLM gateway and router bugs: places where converting between Anthropic and OpenAI style APIs drops fields (thinking blocks, tool calls, attachments, stop reasons), mishandles refusals and content filtering, or leaks credentials and org headers through a proxy (NVIDIA-NeMo/Switchyard, mozilla-ai/any-llm). I also fix response-parsing and patch-application correctness in coding-agent tooling like SakanaAI/ShinkaEvolve: block-type parsing, edit-marker placement, and formatting validation for generated patches. Mostly inference-side work: request and response shapes, streaming, and the spots where providers quietly disagree.";

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
