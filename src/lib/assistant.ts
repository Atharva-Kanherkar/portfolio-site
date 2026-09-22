import { generateText, streamText, stepCountIs, tool } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { z } from 'zod';
import { SITE } from '../consts';
import { buildAssistantSystemPrompt } from './assistant-prompt';
import { absoluteUrl } from './agent-http';
import { fetchMergedPrs } from './github';

export type ChatRole = 'user' | 'assistant';

export type ChatMessage = {
  role: ChatRole;
  content: string;
};

export const MAX_MESSAGES = 24;
export const MAX_USER_CONTENT_LENGTH = 2000;
export const MAX_ASSISTANT_CONTENT_LENGTH = 12000;

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
    rate_limit: '12 requests per minute per client; HTTP 429 with Retry-After past that. Static dumps (/for-agents.md, /llms-full.txt, /api/site.json) are unmetered — prefer them for bulk facts.',
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

const assistantTools = {
  getRecentOpenSourceActivity: tool({
    description:
      "Atharva's most recent merged pull requests on GitHub — live, not from memory. Defaults to community contributions (PRs to projects he does not own); pass type \"all\" to include his own repos too. Use this for any question about his current or recent open-source work, what he's contributing to lately, or specific PRs/repos.",
    inputSchema: z.object({
      type: z
        .enum(['community', 'all'])
        .optional()
        .describe('community = PRs to projects he does not own (default). all = including his own repos.'),
      limit: z
        .number()
        .int()
        .min(1)
        .max(10)
        .optional()
        .describe('How many recent merged PRs to return. Defaults to 5.'),
    }),
    execute: async ({ type, limit }) => {
      const data = await fetchMergedPrs({ type: type ?? 'community', per_page: limit ?? 5 });
      return {
        live: data.isLive ?? false,
        total_count: data.total_count,
        pull_requests: data.prs.map((pr) => ({
          repo: pr.repo,
          number: pr.number,
          title: pr.title,
          url: pr.url,
          merged_at: pr.merged_at,
        })),
      };
    },
  }),
};

function resolveModel() {
  const apiKey = import.meta.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  const openai = createOpenAI({ apiKey });
  return openai(import.meta.env.OPENAI_MODEL ?? 'gpt-5-mini');
}

export async function completeAssistantJson(
  messages: ChatMessage[],
): Promise<{ reply: string } | { error: string; status: number }> {
  const model = resolveModel();
  if (!model) return { error: 'Chat is not configured yet.', status: 503 };

  try {
    const result = await generateText({
      model,
      system: buildAssistantSystemPrompt(),
      messages,
      tools: assistantTools,
      stopWhen: stepCountIs(4),
    });

    const reply = result.text.trim();
    if (!reply) return { error: 'The assistant is unavailable right now.', status: 502 };
    return { reply };
  } catch (error) {
    console.error('Assistant completion failed:', error);
    return { error: 'The assistant is unavailable right now.', status: 500 };
  }
}

export async function completeAssistantStream(
  messages: ChatMessage[],
): Promise<Response | { error: string; status: number }> {
  const model = resolveModel();
  if (!model) return { error: 'Chat is not configured yet.', status: 503 };

  try {
    const result = streamText({
      model,
      system: buildAssistantSystemPrompt(),
      messages,
      tools: assistantTools,
      stopWhen: stepCountIs(4),
      onError: ({ error }) => console.error('Assistant stream failed:', error),
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('Assistant stream failed:', error);
    return { error: 'The assistant is unavailable right now.', status: 500 };
  }
}

export function wantsStream(body: unknown): boolean {
  if (body && typeof body === 'object' && 'stream' in body) {
    return (body as { stream?: unknown }).stream !== false;
  }
  return true;
}
