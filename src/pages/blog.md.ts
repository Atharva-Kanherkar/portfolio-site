import type { APIRoute } from 'astro';
import { buildBlogIndexMarkdown } from '../lib/agent-content';
import { markdownResponse } from '../lib/agent-http';

export const prerender = true;

export const GET: APIRoute = async () => markdownResponse(await buildBlogIndexMarkdown());
