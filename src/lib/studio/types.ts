// Categories mirror the `section` enum in src/content.config.ts exactly.
export const SECTIONS = ['vedanta', 'ai', 'math', 'general'] as const;
export type Section = (typeof SECTIONS)[number];

export interface Frontmatter {
  title: string;
  description: string;
  section: Section;
  tags: string[];
}

/** What the editor produces/consumes. `markdown` is the BODY only (no `---` fence). */
export interface StudioDocument {
  frontmatter: Frontmatter;
  markdown: string;
}

/** A draft persisted in Vercel Blob. */
export interface StudioDraft extends StudioDocument {
  id: string;
  updatedAt: string;
  /** Set when this draft maps to an already-published post (edit flow). */
  publishedSlug?: string;
}

export function emptyFrontmatter(): Frontmatter {
  return { title: '', description: '', section: 'general', tags: [] };
}
