import { SITE } from '../consts';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD',
  'Cache-Control': 'public, max-age=300',
} as const;

export function absoluteUrl(path: string): string {
  return new URL(path, `${SITE.url}/`).href;
}

export function markdownPathFor(pathname: string): string | null {
  const path = pathname.replace(/\/+$/, '') || '/';
  if (
    path.endsWith('.md') ||
    path.endsWith('.txt') ||
    path.endsWith('.json') ||
    path.endsWith('.xml') ||
    path.startsWith('/studio') ||
    path.startsWith('/api/')
  ) {
    return null;
  }

  switch (path) {
    case '/':
      return '/index.md';
    case '/blog':
      return '/blog.md';
    case '/for-agents':
      return '/for-agents.md';
    case '/benchmarks/crashout':
      return '/benchmarks/crashout.md';
    default:
      if (path.startsWith('/blog/')) return `${path}.md`;
      return null;
  }
}

export function markdownResponse(body: string): Response {
  return new Response(body, {
    headers: {
      ...CORS,
      'Content-Type': 'text/markdown; charset=utf-8',
      Link: '</llms.txt>; rel="describedby"',
    },
  });
}

export function plainTextResponse(body: string): Response {
  return new Response(body, {
    headers: {
      ...CORS,
      'Content-Type': 'text/plain; charset=utf-8',
      Link: '</llms.txt>; rel="describedby"',
    },
  });
}

export function jsonResponse(data: unknown): Response {
  return new Response(`${JSON.stringify(data, null, 2)}\n`, {
    headers: {
      ...CORS,
      'Content-Type': 'application/json; charset=utf-8',
      Link: '</llms.txt>; rel="describedby"',
    },
  });
}
