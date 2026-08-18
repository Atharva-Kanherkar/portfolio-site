import type { APIRoute } from 'astro';
import { buildLlmsTxt } from '../lib/agent-content';
import { plainTextResponse } from '../lib/agent-http';

export const prerender = true;

export const GET: APIRoute = () => plainTextResponse(buildLlmsTxt());
