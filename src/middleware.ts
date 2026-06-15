import { defineMiddleware } from 'astro:middleware';
import { readSessionJWE, SESSION_COOKIE } from '@studio/session';

// Pre-auth endpoints that must stay reachable without a session.
const OPEN_PREFIXES = ['/studio/login', '/api/studio/auth/'];

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;
  const isStudio = pathname.startsWith('/studio') || pathname.startsWith('/api/studio');
  if (!isStudio) return next();

  if (OPEN_PREFIXES.some((p) => pathname === p || pathname.startsWith(p))) {
    return next();
  }

  // Dev-only bypass so the studio can be exercised locally without GitHub OAuth.
  // `import.meta.env.DEV` is false in production builds, so this branch is stripped
  // entirely at build time — it can never authorize anyone in prod.
  if (import.meta.env.DEV && import.meta.env.STUDIO_DEV_LOGIN) {
    context.locals.studio = {
      login: import.meta.env.STUDIO_DEV_LOGIN,
      token: import.meta.env.STUDIO_DEV_TOKEN ?? '',
    };
    return next();
  }

  const session = await readSessionJWE(context.cookies.get(SESSION_COOKIE)?.value);
  const allowedLogin = import.meta.env.GITHUB_ALLOWED_LOGIN;

  if (session && allowedLogin && session.login === allowedLogin) {
    context.locals.studio = { login: session.login, token: session.token };
    return next();
  }

  if (pathname.startsWith('/api/studio')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  return context.redirect('/studio/login');
});
