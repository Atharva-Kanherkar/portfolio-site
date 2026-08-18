import type { APIRoute } from 'astro';
import { buildForAgentsMarkdown } from '../lib/agent-content';
import { markdownResponse } from '../lib/agent-http';

export const prerender = true;

export const GET: APIRoute = async () => markdownResponse(await buildForAgentsMarkdown());
