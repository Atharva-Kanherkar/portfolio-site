import type { APIRoute } from 'astro';
import { AGENT_CORS, corsPreflight } from '../../../lib/agent-http';
import { fetchMergedPrs } from '../../../lib/github';

export const prerender = false;

export const OPTIONS: APIRoute = () => corsPreflight();

export const GET: APIRoute = async ({ url }) => {
  const typeParam = url.searchParams.get('type');
  const type: 'community' | 'all' = typeParam === 'all' ? 'all' : 'community';

  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const per_page = parseInt(url.searchParams.get('per_page') || '10', 10);
  const forceRefresh = url.searchParams.get('refresh') === '1' || url.searchParams.get('refresh') === 'true';

  try {
    const data = await fetchMergedPrs({
      type,
      page: Number.isNaN(page) ? 1 : page,
      per_page: Number.isNaN(per_page) ? 10 : per_page,
      forceRefresh,
    });

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
        error: error instanceof Error ? error.message : 'Failed to fetch merged PRs',
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
