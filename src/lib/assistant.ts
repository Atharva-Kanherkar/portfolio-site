import { SITE } from '../consts';
import { buildAssistantSystemPrompt } from './assistant-prompt';
import { absoluteUrl } from './agent-http';

export type ChatRole = 'user' | 'assistant';

export type ChatMessage = {
  role: ChatRole;
  content: string;
};

export const MAX_MESSAGES = 24;
export const MAX_USER_CONTENT_LENGTH = 2000;
export const MAX_ASSISTANT_CONTENT_LENGTH = 12000;

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';

export function isValidMessages(value: unknown): value is ChatMessage[] {
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

export function isValidQuestion(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= MAX_USER_CONTENT_LENGTH;
}

export function assistantApiDocs() {
  return {
    name: `${SITE.author}'s portfolio assistant`,
    same_as: 'The Ask button on the HTML site',
    note: 'Same assistant humans get from Ask. No auth. CORS is open. Do not try to click the button.',
    one_shot: {
      method: 'GET',
      url: absoluteUrl('/api/ask'),
      query: { q: 'your question', format: 'json | text' },
      example: `${absoluteUrl('/api/ask')}?q=${encodeURIComponent('What does Atharva work on?')}`,
    },
    chat: {
      method: 'POST',
      url: absoluteUrl('/api/chat'),
      body: {
        messages: [{ role: 'user', content: 'What does Atharva work on?' }],
        stream: false,
      },
      note: 'stream defaults to true (plain-text chunks) for the on-site Ask UI. Send stream:false for a JSON reply.',
    },
  };
}

function openaiPayload(messages: ChatMessage[], stream: boolean): Record<string, unknown> {
  const model = import.meta.env.OPENAI_MODEL ?? 'gpt-5-mini';
  const payload: Record<string, unknown> = {
    model,
    stream,
    messages: [{ role: 'system', content: buildAssistantSystemPrompt() }, ...messages],
  };
  if (!model.startsWith('gpt-5')) {
    payload.temperature = 0.4;
  }
  return payload;
}

async function openaiFetch(payload: Record<string, unknown>): Promise<Response | { error: string; status: number }> {
  const apiKey = import.meta.env.OPENAI_API_KEY;
  if (!apiKey) {
    return { error: 'Chat is not configured yet.', status: 503 };
  }

  try {
    const response = await fetch(OPENAI_URL, {
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
      return { error: 'The assistant is unavailable right now.', status: 502 };
    }

    return response;
  } catch (error) {
    console.error('Chat route failed:', error);
    return { error: 'The assistant is unavailable right now.', status: 500 };
  }
}

export async function completeAssistantJson(
  messages: ChatMessage[],
): Promise<{ reply: string } | { error: string; status: number }> {
  const upstream = await openaiFetch(openaiPayload(messages, false));
  if ('error' in upstream) return upstream;

  try {
    const data = (await upstream.json()) as {
      choices?: Array<{ message?: { content?: string | Array<{ text?: string }> } }>;
    };
    const content = data.choices?.[0]?.message?.content;
    const reply = Array.isArray(content)
      ? content.map((part) => part.text ?? '').join('')
      : (content ?? '');
    const trimmed = reply.trim();
    if (!trimmed) {
      return { error: 'The assistant is unavailable right now.', status: 502 };
    }
    return { reply: trimmed };
  } catch (error) {
    console.error('Chat JSON parse failed:', error);
    return { error: 'The assistant is unavailable right now.', status: 500 };
  }
}

export async function completeAssistantStream(
  messages: ChatMessage[],
): Promise<ReadableStream<Uint8Array> | { error: string; status: number }> {
  const upstream = await openaiFetch(openaiPayload(messages, true));
  if ('error' in upstream) return upstream;

  const body = upstream.body;
  if (!body) {
    return { error: 'The assistant is unavailable right now.', status: 502 };
  }

  const decoder = new TextDecoder();
  const encoder = new TextEncoder();

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = body.getReader();
      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith('data:')) continue;

            const data = trimmed.slice(5).trim();
            if (!data || data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data) as {
                choices?: Array<{ delta?: { content?: string } }>;
              };
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) controller.enqueue(encoder.encode(content));
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
}

export function wantsStream(body: unknown): boolean {
  if (body && typeof body === 'object' && 'stream' in body) {
    return (body as { stream?: unknown }).stream !== false;
  }
  return true;
}
