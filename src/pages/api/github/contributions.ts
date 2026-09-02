import type { APIRoute } from 'astro';
import { AGENT_CORS, corsPreflight } from '../../../lib/agent-http';
import { fetchContributions } from '../../../lib/github';

export const prerender = false;

export const OPTIONS: APIRoute = () => corsPreflight();

export const GET: APIRoute = async ({ url }) => {
  const username = url.searchParams.get('username') || 'Atharva-Kanherkar';
  const forceRefresh = url.searchParams.get('refresh') === '1' || url.searchParams.get('refresh') === 'true';

  try {
    const data = await fetchContributions(username, forceRefresh);

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        ...AGENT_CORS,
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': forceRefresh ? 'no-cache, no-store' : 'public, s-maxage=300, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Failed to fetch contributions',
      }),
      {
        status: 500,
        headers: {
          ...AGENT_CORS,
          'Content-Type': 'application/json; charset=utf-8',
        },
      },
    );
  }
};
