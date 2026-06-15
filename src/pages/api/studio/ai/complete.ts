import type { APIRoute } from 'astro';
import { streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { z } from 'zod';
import { transformSystemPrompt } from '@studio/ai-prompts';

export const prerender = false;

const Body = z.object({
  mode: z.enum(['improve', 'expand', 'shorten', 'grammar', 'tone', 'continue', 'autocomplete']),
  selection: z.string().max(8000).optional(),
  context: z.string().max(20000).optional(),
  tone: z.string().max(40).optional(),
});

export const POST: APIRoute = async ({ request }) => {
  const apiKey = import.meta.env.OPENAI_API_KEY;
  if (!apiKey) return new Response('AI is not configured.', { status: 503 });

  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return new Response('Bad request', { status: 400 });
  const { mode, selection, context, tone } = parsed.data;

  const openai = createOpenAI({ apiKey });
  const result = streamText({
    model: openai(import.meta.env.OPENAI_MODEL ?? 'gpt-5-mini'),
    system: transformSystemPrompt(mode, tone),
    prompt:
      mode === 'autocomplete' || mode === 'continue'
        ? `Continue this text:\n\n${context ?? selection ?? ''}`
        : selection ?? '',
    maxOutputTokens: mode === 'autocomplete' ? 60 : 1000,
  });

  return result.toTextStreamResponse();
};
