import type { APIRoute } from 'astro';
import { buildCrashoutMarkdown } from '../../lib/agent-content';
import { markdownResponse } from '../../lib/agent-http';

export const prerender = true;

export const GET: APIRoute = () => markdownResponse(buildCrashoutMarkdown());
