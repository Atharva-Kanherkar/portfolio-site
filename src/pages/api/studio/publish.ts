import type { APIRoute } from 'astro';
import { json } from '@studio/http';
import { validateFrontmatter, slugify, buildMarkdownFile } from '@studio/frontmatter';
import { getFileSha, putFile } from '@studio/contents-api';

export const prerender = false;

const postPath = (slug: string) => `src/content/blog/${slug}.md`;

export const POST: APIRoute = async ({ request, locals }) => {
  const token = locals.studio?.token;
  if (!token) return json({ error: 'Sign in with GitHub to publish.' }, 401);

  let body: { frontmatter?: unknown; markdown?: unknown; slug?: unknown; pubDate?: unknown };
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  const fm = validateFrontmatter(body.frontmatter);
  if (!fm.ok) return json({ error: fm.error }, 422);

  const markdown = typeof body.markdown === 'string' ? body.markdown : '';
  if (!markdown.trim()) return json({ error: 'The post body is empty.' }, 422);

  const explicitSlug = typeof body.slug === 'string' && body.slug ? body.slug : null;
  const isUpdate = explicitSlug !== null;
  const baseSlug = explicitSlug ?? slugify(fm.data.title);
  if (!baseSlug) return json({ error: 'Could not derive a slug from the title.' }, 422);

  let slug = baseSlug;
  let sha: string | undefined;

  try {
    if (isUpdate) {
      sha = (await getFileSha(token, postPath(slug))) ?? undefined;
    } else {
      // Avoid clobbering an existing post: suffix -2, -3, …
      let n = 1;
      while (await getFileSha(token, postPath(slug))) {
        n += 1;
        slug = `${baseSlug}-${n}`;
        if (n > 50) return json({ error: 'Too many slug collisions.' }, 409);
      }
    }
  } catch {
    return json({ error: 'Could not reach GitHub.' }, 502);
  }

  const today = new Date().toISOString().slice(0, 10);
  const pubDate = typeof body.pubDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(body.pubDate) ? body.pubDate : today;
  const updatedDate = isUpdate ? today : undefined;

  const fileContent = buildMarkdownFile(fm.data, markdown, { pubDate, updatedDate });
  const message = `${isUpdate ? 'Update' : 'Add'} post: ${fm.data.title}`;

  try {
    const result = await putFile(token, postPath(slug), fileContent, message, sha);
    return json({ slug, path: result.path, commit: result.commit });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : 'Commit failed.' }, 502);
  }
};
