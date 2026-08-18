import { getCollection } from 'astro:content';
import {
  BIO,
  PROJECTS_INTRO,
  SITE,
  WRITING_INTRO,
  WRITING_SECTIONS,
} from '../consts';
import {
  CRASHOUT_AGREED,
  CRASHOUT_DESCRIPTION,
  CRASHOUT_FLAGGED,
  CRASHOUT_RECEIPTS,
  CRASHOUT_REGRETS,
  CRASHOUT_TAKES,
  CRASHOUT_TITLE,
  CRASHOUT_TOOLS,
  crashoutBoard,
  crashoutMethodology,
  crashoutTotalReviewed,
  fmtCrashoutN,
} from '../crashout';
import { PROJECTS } from '../projects';
import { TIMELINE } from '../timeline';
import { assistantApiDocs } from './assistant';
import { absoluteUrl } from './agent-http';

const ABOUT = {
  name: SITE.author,
  age: 22,
  bio: BIO,
  description: SITE.description,
  languages: ['TypeScript', 'Go', 'Scala'],
  interests: ['open source', 'inclusive AI', 'Advaita Vedanta', 'Indian philosophy'],
  contact: {
    github: SITE.github,
    x: SITE.twitter,
    x_url: `https://x.com/${SITE.twitter.replace(/^@/, '')}`,
    medium: SITE.medium,
    x_articles: SITE.xArticles,
  },
} as const;

type BlogPost = Awaited<ReturnType<typeof getPublishedPosts>>[number];

async function getPublishedPosts() {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  return posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

function sectionLabel(id: string): string {
  return WRITING_SECTIONS.find((section) => section.id === id)?.label ?? id;
}

function iso(date: Date): string {
  return date.toISOString();
}

function mdLink(title: string, path: string, note?: string): string {
  const line = `- [${title}](${absoluteUrl(path)})`;
  return note ? `${line}: ${note}` : line;
}

function crashoutTable(): string {
  const header = '| Rank | Model | Tool | Rage / 1k | Tantrums | Messages | Full meltdowns |';
  const sep = '| ---: | --- | --- | ---: | ---: | ---: | ---: |';
  const rows = crashoutBoard.map((row, index) => {
    const rage = row.rage === 0 ? '—' : String(row.rage);
    return `| ${index + 1} | ${row.model} | ${row.tool} | ${row.rate.toFixed(1)} | ${fmtCrashoutN(row.n)} | ${row.total.toLocaleString()} | ${rage} |`;
  });
  return [header, sep, ...rows].join('\n');
}

function judgeNote(): string {
  return `Every score is the average of two independent judges. Claude opus-4-8 flagged ${CRASHOUT_FLAGGED} crashouts; Codex gpt-5.5 then re-read every one blind and agreed on ${CRASHOUT_AGREED}, so the averaged tantrum counts land around 84. Letting a rival lab's model re-grade is the whole point, and it barely flinched: gpt-5.x still tops its own leaderboard.`;
}

export async function buildSiteJson() {
  const posts = await getPublishedPosts();

  return {
    id: SITE.url,
    name: ABOUT.name,
    url: SITE.url,
    description: SITE.description,
    bio: BIO,
    how_to_read: {
      note: 'Prefer these machine-readable URLs over HTML, photos, or charts. To talk to the on-site Ask assistant, GET /api/ask?q=...',
      endpoints: {
        for_agents: absoluteUrl('/for-agents.md'),
        llms_txt: absoluteUrl('/llms.txt'),
        llms_full: absoluteUrl('/llms-full.txt'),
        site_json: absoluteUrl('/api/site.json'),
        ask: absoluteUrl('/api/ask'),
        chat: absoluteUrl('/api/chat'),
        home_md: absoluteUrl('/index.md'),
        musings_md: absoluteUrl('/blog.md'),
        crashout_md: absoluteUrl('/benchmarks/crashout.md'),
        rss: absoluteUrl('/rss.xml'),
      },
    },
    assistant: assistantApiDocs(),
    about: ABOUT,
    timeline: TIMELINE,
    projects: {
      intro: PROJECTS_INTRO,
      items: PROJECTS,
    },
    writing: {
      intro: WRITING_INTRO,
      sections: WRITING_SECTIONS,
      posts: posts.map((post) => ({
        slug: post.id,
        title: post.data.title,
        description: post.data.description,
        section: post.data.section,
        section_label: sectionLabel(post.data.section),
        published: iso(post.data.pubDate),
        updated: iso(post.data.updatedDate ?? post.data.pubDate),
        tags: post.data.tags,
        url: absoluteUrl(`/blog/${post.id}`),
        markdown_url: absoluteUrl(`/blog/${post.id}.md`),
        body: post.body ?? '',
      })),
    },
    benchmarks: {
      crashout: {
        title: CRASHOUT_TITLE,
        url: absoluteUrl('/benchmarks/crashout'),
        markdown_url: absoluteUrl('/benchmarks/crashout.md'),
        description: CRASHOUT_DESCRIPTION,
        messages_read: crashoutTotalReviewed,
        crashouts_flagged: CRASHOUT_FLAGGED,
        crashouts_agreed: CRASHOUT_AGREED,
        tools: CRASHOUT_TOOLS,
        regrets: CRASHOUT_REGRETS,
        ranking_metric: 'crashouts per 1,000 messages',
        judges: ['claude-opus-4-8', 'gpt-5.5'],
        methodology: crashoutMethodology(),
        judge_note: judgeNote(),
        leaderboard: crashoutBoard.map((row, index) => ({
          rank: index + 1,
          model: row.model,
          tool: row.tool,
          rage_per_1k: row.rate,
          tantrums: row.n,
          claude_n: row.claudeN,
          codex_n: row.codexN,
          messages: row.total,
          full_meltdowns: row.rage,
        })),
        takes: CRASHOUT_TAKES.map(({ lead, body }) => ({ lead, body })),
        receipts: CRASHOUT_RECEIPTS.map(({ quote, model, tool, tag }) => ({
          quote,
          model,
          tool,
          tag,
        })),
      },
    },
    pages: [
      { path: '/', markdown: '/index.md', summary: 'Bio, timeline, and selected projects.' },
      { path: '/blog', markdown: '/blog.md', summary: 'Musings archive.' },
      ...posts.map((post) => ({
        path: `/blog/${post.id}`,
        markdown: `/blog/${post.id}.md`,
        summary: post.data.title,
      })),
      {
        path: '/benchmarks/crashout',
        markdown: '/benchmarks/crashout.md',
        summary: 'CrashoutBench leaderboard as tables, not charts.',
      },
      { path: '/for-agents', markdown: '/for-agents.md', summary: 'This agent-readable dump.' },
    ],
  };
}

export function buildLlmsTxt(): string {
  return `# ${SITE.author}

> ${SITE.description}

${BIO}

This site publishes a machine-readable copy for AI agents. Fetch those files instead of scraping HTML, interpreting CSS, or reading SVG charts.

There is also an on-site assistant (the Ask button). Do not try to click it. Call it:

- GET ${absoluteUrl('/api/ask')}?q=your+question
- POST ${absoluteUrl('/api/chat')} with \`{ "messages": [...], "stream": false }\`

## Start here

${mdLink('For agents', '/for-agents.md', 'Full site as markdown — bio, work, projects, musings, and CrashoutBench tables.')}
${mdLink('Site JSON', '/api/site.json', 'Same facts as structured JSON, plus assistant API docs.')}
${mdLink('Ask the assistant', '/api/ask', 'One-shot Q&A. Pass ?q=... Same model as the Ask button.')}
${mdLink('llms-full.txt', '/llms-full.txt', 'Concatenated markdown of every public page.')}

## Pages

${mdLink('Home', '/index.md', 'Bio, timeline, and selected projects.')}
${mdLink('Musings', '/blog.md', 'Writing index with markdown links to each post.')}
${mdLink('CrashoutBench', '/benchmarks/crashout.md', 'Leaderboard, takes, receipts, and method as tables and prose.')}

## Optional

${mdLink('RSS', '/rss.xml', 'Musings feed.')}
${mdLink('GitHub', SITE.github, 'Source and projects.')}
${mdLink('X', `https://x.com/${SITE.twitter.replace(/^@/, '')}`, 'Shorter public writing.')}
${mdLink('Medium', SITE.medium, 'Longer public writing.')}
`;
}

export function buildHomeMarkdown(): string {
  const timeline = TIMELINE.map(
    (entry) => `### ${entry.period} · ${entry.title}\n\n${entry.description}`,
  ).join('\n\n');

  const projects = PROJECTS.map((project) => {
    const links = [
      project.github ? `[GitHub](${project.github})` : null,
      project.live ? `[Live](${project.live})` : null,
    ]
      .filter(Boolean)
      .join(' · ');
    return `### ${project.name}\n\n${project.description}${links ? `\n\n${links}` : ''}`;
  }).join('\n\n');

  return `# ${SITE.author}

${BIO}

## Work

${timeline}

## Projects

${PROJECTS_INTRO} For everything else, see [GitHub](${SITE.github}).

${projects}
`;
}

export async function buildBlogIndexMarkdown(): Promise<string> {
  const posts = await getPublishedPosts();
  const sections = WRITING_SECTIONS.map((section) => {
    const items = posts.filter((post) => post.data.section === section.id);
    if (items.length === 0) return '';
    const list = items
      .map((post) => {
        const date = post.data.pubDate.toISOString().slice(0, 10);
        return mdLink(post.data.title, `/blog/${post.id}.md`, `${date}. ${post.data.description}`);
      })
      .join('\n');
    return `## ${section.label}\n\n${section.description}\n\n${list}`;
  }).filter(Boolean);

  return `# Musings

${WRITING_INTRO} [Medium](${SITE.medium}) and [X articles](${SITE.xArticles}) too.

${sections.join('\n\n')}
`;
}

export function buildPostMarkdown(post: BlogPost): string {
  const published = post.data.pubDate.toISOString().slice(0, 10);
  const tags = post.data.tags.length > 0 ? post.data.tags.join(', ') : 'none';
  return `# ${post.data.title}

${post.data.description}

- Section: ${sectionLabel(post.data.section)}
- Published: ${published}
- Tags: ${tags}
- HTML: ${absoluteUrl(`/blog/${post.id}`)}

${post.body?.trim() ?? ''}
`;
}

export function buildCrashoutMarkdown(): string {
  const takes = CRASHOUT_TAKES.map((take) => `- **${take.lead}** ${take.body}`).join('\n');
  const receipts = CRASHOUT_RECEIPTS.map(
    (receipt) => `### ${receipt.tag}\n\n> ${receipt.quote}\n\n— ${receipt.model} · ${receipt.tool}`,
  ).join('\n\n');

  return `# ${CRASHOUT_TITLE}

${CRASHOUT_DESCRIPTION}

The visual chart on the HTML page is hard for agents. Use this table instead.

| Messages read | Crashouts flagged | Tools | Regrets |
| ---: | ---: | ---: | ---: |
| ${crashoutTotalReviewed.toLocaleString()} | ${CRASHOUT_FLAGGED} | ${CRASHOUT_TOOLS} | ${CRASHOUT_REGRETS} |

Rage rate is crashouts per 1,000 messages. Raw count would just crown whatever model I use most.

## Leaderboard

${crashoutTable()}

${judgeNote()}

## Takes

${takes}

## Receipts

The actual messages. Verbatim, typos included, nothing censored.

${receipts}

## Method

${crashoutMethodology()}
`;
}

export async function buildForAgentsMarkdown(): Promise<string> {
  const posts = await getPublishedPosts();
  const postBlocks = posts.map((post) => buildPostMarkdown(post)).join('\n\n---\n\n');

  return `# For agents

You are reading Atharva Kanherkar's personal site in a form meant for tools. Skip the HTML layout, profile photo, CSS, and SVG charts. Fetch one of the URLs below with curl, WebFetch, or any HTTP GET.

No authentication. CORS is open. \`text/markdown\`, \`text/plain\`, and \`application/json\`.

## Talk to the assistant

The HTML site has an Ask button. That UI is for humans. You are talking to the same assistant if you call these endpoints. No auth.

One-shot (works with WebFetch, curl, or any GET):

\`\`\`
GET ${absoluteUrl('/api/ask')}?q=What+does+Atharva+work+on%3F
\`\`\`

JSON in, JSON out:

\`\`\`sh
curl -sL "${absoluteUrl('/api/ask')}?q=What%20does%20Atharva%20work%20on%3F"
curl -sL "${absoluteUrl('/api/ask')}?q=What%20does%20Atharva%20work%20on%3F&format=text"
\`\`\`

Multi-turn (same conversation the Ask sidebar uses):

\`\`\`sh
curl -sL ${absoluteUrl('/api/chat')} \\
  -H 'Content-Type: application/json' \\
  -H 'Accept: application/json' \\
  -d '{"stream":false,"messages":[{"role":"user","content":"What does Atharva work on?"}]}'
\`\`\`

Limits: 24 messages, 2000 characters per user turn. Default streaming POST is what the Ask button uses; send \`"stream": false\` for a single JSON \`{ "reply": "..." }\`.

## Endpoints

| URL | Format | What you get |
| --- | --- | --- |
| ${absoluteUrl('/for-agents.md')} | markdown | This document (full dump) |
| ${absoluteUrl('/llms.txt')} | markdown | Curated index ([llms.txt](https://llmstxt.org/) spec) |
| ${absoluteUrl('/llms-full.txt')} | markdown | Every public page concatenated |
| ${absoluteUrl('/api/site.json')} | JSON | Structured profile, work, projects, posts, CrashoutBench, assistant API |
| ${absoluteUrl('/api/ask')} | JSON or text | On-site assistant. GET \`?q=\` or POST \`{"q":"..."}\` |
| ${absoluteUrl('/api/chat')} | JSON or text stream | Multi-turn assistant. POST messages. |
| ${absoluteUrl('/index.md')} | markdown | Home |
| ${absoluteUrl('/blog.md')} | markdown | Musings index |
| ${SITE.url}/blog/{slug}.md | markdown | One musing |
| ${absoluteUrl('/benchmarks/crashout.md')} | markdown | CrashoutBench as tables |

Example:

\`\`\`sh
curl -sL ${absoluteUrl('/api/site.json')}
curl -sL ${absoluteUrl('/llms.txt')}
curl -sL ${absoluteUrl('/for-agents.md')}
curl -sL "${absoluteUrl('/api/ask')}?q=Who%20is%20Atharva%3F"
\`\`\`

HTML pages also advertise these via \`rel="describedby"\` → \`/llms.txt\` and \`rel="alternate" type="text/markdown"\`.

## Contact

GitHub: ${SITE.github}
X: ${SITE.twitter} (${ABOUT.contact.x_url})
Medium: ${SITE.medium}

For collaboration or jobs, GitHub or X is enough. Do not invent an email.

---

${buildHomeMarkdown().replace(/^# .+\n+/, '## About\n\n')}

---

${(await buildBlogIndexMarkdown()).replace(/^# .+\n+/, '## Musings\n\n')}

---

## Full musings

${postBlocks}

---

${buildCrashoutMarkdown().replace(/^# .+\n+/, '## CrashoutBench\n\n')}
`;
}

export async function buildLlmsFullTxt(): Promise<string> {
  const posts = await getPublishedPosts();
  const parts = [
    buildHomeMarkdown(),
    await buildBlogIndexMarkdown(),
    ...posts.map((post) => buildPostMarkdown(post)),
    buildCrashoutMarkdown(),
  ];
  return parts.join('\n\n---\n\n');
}

export async function findPost(slug: string): Promise<BlogPost | undefined> {
  const posts = await getPublishedPosts();
  return posts.find((post) => post.id === slug);
}

export async function publishedPostSlugs(): Promise<string[]> {
  const posts = await getPublishedPosts();
  return posts.map((post) => post.id);
}
