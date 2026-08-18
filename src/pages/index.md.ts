import type { APIRoute } from 'astro';
import { buildHomeMarkdown } from '../lib/agent-content';
import { markdownResponse } from '../lib/agent-http';

export const prerender = true;

export const GET: APIRoute = () => markdownResponse(buildHomeMarkdown());
