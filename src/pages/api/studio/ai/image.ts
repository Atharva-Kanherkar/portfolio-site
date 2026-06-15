import type { APIRoute } from 'astro';
import { z } from 'zod';
import { json } from '@studio/http';
import { putImage } from '@studio/blob';

export const prerender = false;

const Body = z.object({
  prompt: z.string().min(1).max(4000),
  size: z.enum(['1024x1024', '1536x1024', '1024x1536']).default('1024x1024'),
  quality: z.enum(['low', 'medium', 'high']).default('medium'),
});

export const POST: APIRoute = async ({ request }) => {
  const apiKey = import.meta.env.OPENAI_API_KEY;
  if (!apiKey) return json({ error: 'AI is not configured.' }, 503);

  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return json({ error: 'Bad request' }, 400);
  const { prompt, size, quality } = parsed.data;

  try {
    const res = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-image-2',
        prompt,
        size,
        quality,
        n: 1,
        output_format: 'webp',
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      return json({ error: `Image generation failed (${res.status})`, detail: text.slice(0, 200) }, 502);
    }

    const data = (await res.json()) as { data?: Array<{ b64_json?: string }> };
    const b64 = data.data?.[0]?.b64_json;
    if (!b64) return json({ error: 'No image returned.' }, 502);

    const url = await putImage(Buffer.from(b64, 'base64'), 'image/webp');
    return json({ url, alt: prompt.slice(0, 120) });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : 'Image generation failed.' }, 502);
  }
};
