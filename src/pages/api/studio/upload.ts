import type { APIRoute } from 'astro';
import { json } from '@studio/http';
import { putImage } from '@studio/blob';

export const prerender = false;

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif']);

export const POST: APIRoute = async ({ request }) => {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return json({ error: 'Invalid form data' }, 400);
  }

  const file = form.get('file');
  if (!(file instanceof File)) return json({ error: 'No file provided' }, 400);
  if (!ALLOWED.has(file.type)) return json({ error: 'Unsupported image type' }, 415);
  if (file.size > MAX_BYTES) return json({ error: 'Image too large (max 10MB)' }, 413);

  try {
    const url = await putImage(file, file.type);
    return json({ url });
  } catch {
    return json({ error: 'Upload failed' }, 500);
  }
};
