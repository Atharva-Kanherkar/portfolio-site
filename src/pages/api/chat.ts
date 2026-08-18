import type { APIRoute } from 'astro';
import { AGENT_CORS, corsPreflight } from '../../lib/agent-http';
import {
  completeAssistantJson,
  completeAssistantStream,
  isValidMessages,
  wantsStream,
} from '../../lib/assistant';

export const prerender = false;

function errorResponse(message: string, status: number) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: {
      ...AGENT_CORS,
      'Content-Type': 'application/json; charset=utf-8',
    },
  });
}

export const OPTIONS: APIRoute = () => corsPreflight();

export const GET: APIRoute = () =>
  new Response(
    JSON.stringify(
      {
        error: 'POST a messages array, or GET /api/ask?q=... for a one-shot question.',
        docs: '/for-agents.md',
        ask: '/api/ask?q=',
      },
      null,
      2,
    ) + '\n',
    {
      status: 405,
      headers: {
        ...AGENT_CORS,
        Allow: 'POST, OPTIONS',
        'Content-Type': 'application/json; charset=utf-8',
      },
    },
  );

export const POST: APIRoute = async ({ request }) => {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return errorResponse('Invalid request body.', 400);
  }

  if (!body || typeof body !== 'object' || !('messages' in body) || !isValidMessages(body.messages)) {
    return errorResponse('Invalid messages.', 400);
  }

  const stream = wantsStream(body);

  if (!stream) {
    const result = await completeAssistantJson(body.messages);
    if ('error' in result) {
      return errorResponse(result.error, result.status);
    }
    return new Response(JSON.stringify({ reply: result.reply }) + '\n', {
      status: 200,
      headers: {
        ...AGENT_CORS,
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    });
  }

  const result = await completeAssistantStream(body.messages);
  if ('error' in result) {
    return errorResponse(result.error, result.status);
  }

  return new Response(result, {
    status: 200,
    headers: {
      ...AGENT_CORS,
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
};
