import type { APIRoute } from 'astro';
import { json } from '@studio/http';
import { getDraft, deleteDraft } from '@studio/drafts';

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  const id = params.id;
  if (!id) return json({ error: 'Missing id' }, 400);
  const draft = await getDraft(id);
  return draft ? json(draft) : json({ error: 'Not found' }, 404);
};

export const DELETE: APIRoute = async ({ params }) => {
  const id = params.id;
  if (!id) return json({ error: 'Missing id' }, 400);
  try {
    await deleteDraft(id);
    return json({ ok: true });
  } catch {
    return json({ error: 'Could not delete draft' }, 500);
  }
};
