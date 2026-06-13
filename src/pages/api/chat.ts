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

export const POST: APIRoute = async ({ request }) => {
  const apiKey = import.meta.env.OPENAI_API_KEY;

  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'Chat is not configured yet.' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!body || typeof body !== 'object' || !('messages' in body) || !isValidMessages(body.messages)) {
    return new Response(JSON.stringify({ error: 'Invalid messages.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const model = import.meta.env.OPENAI_MODEL ?? 'gpt-5-mini';

  const payload: Record<string, unknown> = {
    model,
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

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI error:', errorText);
      return new Response(JSON.stringify({ error: 'The assistant is unavailable right now.' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const reply = data.choices?.[0]?.message?.content?.trim();

    if (!reply) {
      return new Response(JSON.stringify({ error: 'Empty response from assistant.' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ reply }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Chat route failed:', error);
    return new Response(JSON.stringify({ error: 'The assistant is unavailable right now.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
