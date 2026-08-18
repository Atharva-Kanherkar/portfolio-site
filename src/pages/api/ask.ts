import type { APIRoute } from 'astro';
import { AGENT_CORS, absoluteUrl, corsPreflight } from '../../lib/agent-http';
import { completeAssistantJson, isValidQuestion } from '../../lib/assistant';
import { rateLimitResponse } from '../../lib/rate-limit';

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

function wantsText(request: Request, format: string | null): boolean {
  if (format === 'text' || format === 'txt' || format === 'md' || format === 'markdown') return true;
  const accept = request.headers.get('accept') ?? '';
  return accept.includes('text/plain') && !accept.includes('application/json');
}

export const OPTIONS: APIRoute = () => corsPreflight();

export const GET: APIRoute = async (context) => {
  const { request, url } = context;
  const question = url.searchParams.get('q') ?? url.searchParams.get('question') ?? '';
  const format = url.searchParams.get('format');

  if (!question.trim()) {
    return new Response(
      JSON.stringify(
        {
          assistant: "Atharva's portfolio assistant",
          same_as: 'The Ask button on the HTML site',
          usage: {
            get: `${absoluteUrl('/api/ask')}?q=your+question`,
            get_text: `${absoluteUrl('/api/ask')}?q=your+question&format=text`,
            post: { q: 'your question' },
            chat: {
              url: absoluteUrl('/api/chat'),
              body: { stream: false, messages: [{ role: 'user', content: 'your question' }] },
            },
          },
          docs: absoluteUrl('/for-agents.md'),
        },
        null,
        2,
      ) + '\n',
      {
        status: 200,
        headers: {
          ...AGENT_CORS,
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': 'no-store',
        },
      },
    );
  }

  if (!isValidQuestion(question)) {
    return errorResponse(
      'Pass a question as ?q=... (max 2000 characters). Example: /api/ask?q=What%20does%20Atharva%20work%20on%3F',
      400,
    );
  }

  const limited = rateLimitResponse(context);
  if (limited) return limited;

  const result = await completeAssistantJson([{ role: 'user', content: question.trim() }]);
  if ('error' in result) {
    return errorResponse(result.error, result.status);
  }

  if (wantsText(request, format)) {
    return new Response(`${result.reply}\n`, {
      status: 200,
      headers: {
        ...AGENT_CORS,
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    });
  }

  return new Response(
    JSON.stringify(
      {
        assistant: "Atharva's portfolio assistant",
        question: question.trim(),
        reply: result.reply,
        docs: absoluteUrl('/for-agents.md'),
      },
      null,
      2,
    ) + '\n',
    {
      status: 200,
      headers: {
        ...AGENT_CORS,
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    },
  );
};

export const POST: APIRoute = async (context) => {
  const { request } = context;
  const limited = rateLimitResponse(context);
  if (limited) return limited;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Invalid request body.', 400);
  }

  const question =
    body && typeof body === 'object' && 'q' in body
      ? (body as { q?: unknown }).q
      : body && typeof body === 'object' && 'question' in body
        ? (body as { question?: unknown }).question
        : undefined;

  if (!isValidQuestion(question)) {
    return errorResponse('JSON body must include q (or question), a non-empty string up to 2000 characters.', 400);
  }

  const result = await completeAssistantJson([{ role: 'user', content: question.trim() }]);
  if ('error' in result) {
    return errorResponse(result.error, result.status);
  }

  return new Response(
    JSON.stringify(
      {
        assistant: "Atharva's portfolio assistant",
        question: question.trim(),
        reply: result.reply,
        docs: absoluteUrl('/for-agents.md'),
      },
      null,
      2,
    ) + '\n',
    {
      status: 200,
      headers: {
        ...AGENT_CORS,
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    },
  );
};
