import type { APIRoute } from 'astro';
import { buildAssistantSystemPrompt } from '../../lib/assistant-prompt';

export const prerender = false;

type ChatRole = 'user' | 'assistant';

type ChatMessage = {
  role: ChatRole;
  content: string;
};

const MAX_MESSAGES = 24;
const MAX_USER_CONTENT_LENGTH = 2000;
const MAX_ASSISTANT_CONTENT_LENGTH = 12000;

function isValidMessages(value: unknown): value is ChatMessage[] {
  if (!Array.isArray(value) || value.length === 0 || value.length > MAX_MESSAGES) {
    return false;
  }

  return value.every((message) => {
    if (
      !message ||
      typeof message !== 'object' ||
      typeof message.content !== 'string' ||
      message.content.trim().length === 0
    ) {
      return false;
    }

    if (message.role === 'user') {
      return message.content.length <= MAX_USER_CONTENT_LENGTH;
    }

    if (message.role === 'assistant') {
      return message.content.length <= MAX_ASSISTANT_CONTENT_LENGTH;
    }

    return false;
  });
}

function errorResponse(message: string, status: number) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const POST: APIRoute = async ({ request }) => {
  const apiKey = import.meta.env.OPENAI_API_KEY;

  if (!apiKey) {
    return errorResponse('Chat is not configured yet.', 503);
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return errorResponse('Invalid request body.', 400);
  }

  if (!body || typeof body !== 'object' || !('messages' in body) || !isValidMessages(body.messages)) {
    return errorResponse('Invalid messages.', 400);
  }

  const model = import.meta.env.OPENAI_MODEL ?? 'gpt-5-mini';

  const payload: Record<string, unknown> = {
    model,
    stream: true,
    messages: [{ role: 'system', content: buildAssistantSystemPrompt() }, ...body.messages],
  };

  if (!model.startsWith('gpt-5')) {
    payload.temperature = 0.4;
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok || !response.body) {
      const errorText = await response.text();
      console.error('OpenAI error:', errorText);
      return errorResponse('The assistant is unavailable right now.', 502);
    }

    const upstream = response.body;
    const decoder = new TextDecoder();
    const encoder = new TextEncoder();

    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        const reader = upstream.getReader();
        let buffer = '';

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              break;
            }

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() ?? '';

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed.startsWith('data:')) {
                continue;
              }

              const data = trimmed.slice(5).trim();
              if (!data || data === '[DONE]') {
                continue;
              }

              try {
                const parsed = JSON.parse(data) as {
                  choices?: Array<{ delta?: { content?: string } }>;
                };
                const content = parsed.choices?.[0]?.delta?.content;

                if (content) {
                  controller.enqueue(encoder.encode(content));
                }
              } catch {
                // Ignore malformed chunks from upstream.
              }
            }
          }
        } catch (error) {
          console.error('Chat stream failed:', error);
          controller.error(error);
          return;
        }

        controller.close();
      },
    });

    return new Response(stream, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Chat route failed:', error);
    return errorResponse('The assistant is unavailable right now.', 500);
  }
};
