import type { APIRoute } from 'astro';
import { buildLlmsFullTxt } from '../lib/agent-content';
import { plainTextResponse } from '../lib/agent-http';

export const prerender = true;

export const GET: APIRoute = async () => plainTextResponse(await buildLlmsFullTxt());
