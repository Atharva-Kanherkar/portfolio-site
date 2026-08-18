import type { APIRoute } from 'astro';
import { buildPostMarkdown, findPost, publishedPostSlugs } from '../../lib/agent-content';
import { markdownResponse } from '../../lib/agent-http';

export const prerender = true;

export async function getStaticPaths() {
  const slugs = await publishedPostSlugs();
  return slugs.map((slug) => ({ params: { slug } }));
}

export const GET: APIRoute = async ({ params }) => {
  const post = await findPost(params.slug ?? '');
  if (!post) {
    return new Response('Not found\n', { status: 404, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  }
  return markdownResponse(buildPostMarkdown(post));
};
