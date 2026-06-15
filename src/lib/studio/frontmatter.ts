import { z } from 'zod';
import type { Frontmatter } from './types';

// Mirrors the editor-controlled fields of src/content.config.ts exactly.
// pubDate / updatedDate / draft are added by the publish route, not the editor.
const FrontmatterSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  description: z.string().trim().min(1, 'Description is required'),
  section: z.enum(['vedanta', 'ai', 'math', 'general']),
  tags: z.array(z.string().trim().min(1)).max(12),
});

export type ValidationResult =
  | { ok: true; data: Frontmatter }
  | { ok: false; error: string };

export function validateFrontmatter(input: unknown): ValidationResult {
  const parsed = FrontmatterSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid frontmatter' };
  }
  return { ok: true, data: parsed.data };
}

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

// YAML single-quoted scalar (escape ' as '').
function yamlStr(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

export interface BuildOptions {
  pubDate: string; // YYYY-MM-DD
  updatedDate?: string; // YYYY-MM-DD
}

/** Assemble a complete markdown file (frontmatter fence + body) matching the content schema. */
export function buildMarkdownFile(fm: Frontmatter, body: string, opts: BuildOptions): string {
  const lines = [
    '---',
    `title: ${yamlStr(fm.title)}`,
    `description: ${yamlStr(fm.description)}`,
    `section: ${fm.section}`,
    `pubDate: ${opts.pubDate}`,
  ];
  if (opts.updatedDate) lines.push(`updatedDate: ${opts.updatedDate}`);
  lines.push(`tags: [${fm.tags.map(yamlStr).join(', ')}]`);
  lines.push('---', '', body.trim(), '');
  return lines.join('\n');
}
