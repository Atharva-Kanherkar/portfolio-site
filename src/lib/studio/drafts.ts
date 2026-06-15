import { put, list, del, get } from '@vercel/blob';
import type { StudioDraft } from './types';

const PREFIX = 'studio/drafts/';
const pathFor = (id: string) => `${PREFIX}${id}.json`;

export interface DraftSummary {
  id: string;
  title: string;
  section: string;
  updatedAt: string;
  publishedSlug?: string;
}

export async function saveDraft(draft: StudioDraft): Promise<void> {
  await put(pathFor(draft.id), JSON.stringify(draft), {
    access: 'private',
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}

export async function getDraft(id: string): Promise<StudioDraft | null> {
  const res = await get(pathFor(id), { access: 'private' });
  if (!res) return null;
  try {
    // res.stream is a web ReadableStream of the blob body.
    return (await new Response(res.stream as ReadableStream).json()) as StudioDraft;
  } catch {
    return null;
  }
}

export async function listDrafts(): Promise<DraftSummary[]> {
  const { blobs } = await list({ prefix: PREFIX });
  const summaries = await Promise.all(
    blobs.map(async (b) => {
      const id = b.pathname.replace(PREFIX, '').replace(/\.json$/, '');
      const draft = await getDraft(id);
      if (!draft) return null;
      return {
        id: draft.id,
        title: draft.frontmatter.title || 'Untitled',
        section: draft.frontmatter.section,
        updatedAt: draft.updatedAt,
        publishedSlug: draft.publishedSlug,
      } satisfies DraftSummary;
    }),
  );
  return summaries
    .filter((s): s is DraftSummary => s !== null)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function deleteDraft(id: string): Promise<void> {
  await del(pathFor(id));
}
