import type { APIRoute } from 'astro';
import { json } from '@studio/http';
import { listDrafts, saveDraft } from '@studio/drafts';
import { emptyFrontmatter, type Frontmatter, type StudioDraft } from '@studio/types';

export const prerender = false;

export const GET: APIRoute = async () => {
  try {
    return json(await listDrafts());
  } catch {
    return json({ error: 'Could not list drafts' }, 500);
  }
};

export const POST: APIRoute = async ({ request }) => {
  let body: Partial<StudioDraft> & { frontmatter?: Frontmatter };
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  const draft: StudioDraft = {
    id: typeof body.id === 'string' && body.id ? body.id : crypto.randomUUID(),
    frontmatter: body.frontmatter ?? emptyFrontmatter(),
    markdown: typeof body.markdown === 'string' ? body.markdown : '',
    updatedAt: new Date().toISOString(),
    publishedSlug: typeof body.publishedSlug === 'string' ? body.publishedSlug : undefined,
  };

  try {
    await saveDraft(draft);
    return json({ id: draft.id, updatedAt: draft.updatedAt });
  } catch {
    return json({ error: 'Could not save draft' }, 500);
  }
};
