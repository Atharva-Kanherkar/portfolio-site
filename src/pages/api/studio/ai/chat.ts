import type { APIRoute } from 'astro';
import { streamText, convertToModelMessages, type UIMessage } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const apiKey = import.meta.env.OPENAI_API_KEY;
  if (!apiKey) return new Response('AI is not configured.', { status: 503 });

  const { messages, docContext } = (await request.json()) as {
    messages: UIMessage[];
    docContext?: string;
  };

  const openai = createOpenAI({ apiKey });
  const result = streamText({
    model: openai(import.meta.env.OPENAI_MODEL ?? 'gpt-5-mini'),
    system:
      'You are a writing collaborator for a personal blog. Help the author draft, edit, ' +
      'and brainstorm. Be concise and concrete. Here is the current document for context:\n\n' +
      `<document>\n${(docContext ?? '').slice(0, 20000)}\n</document>`,
    messages: convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
};
