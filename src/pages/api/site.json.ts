import type { APIRoute } from 'astro';
import { buildSiteJson } from '../../lib/agent-content';
import { jsonResponse } from '../../lib/agent-http';

export const prerender = true;

export const GET: APIRoute = async () => jsonResponse(await buildSiteJson());
