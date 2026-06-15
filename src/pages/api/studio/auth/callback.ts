import type { APIRoute } from 'astro';
import { exchangeCodeForToken, fetchGitHubLogin } from '@studio/github-oauth';
import {
  createSessionJWE,
  OAUTH_STATE_COOKIE,
  SESSION_COOKIE,
  sessionCookieOptions,
} from '@studio/session';

export const prerender = false;

function deny(message: string, status: number) {
  return new Response(message, { status, headers: { 'Content-Type': 'text/plain' } });
}

export const GET: APIRoute = async ({ url, cookies, redirect }) => {
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const expectedState = cookies.get(OAUTH_STATE_COOKIE)?.value;
  cookies.delete(OAUTH_STATE_COOKIE, { path: '/' });

  // CSRF: the round-trip state must match the cookie we set at /login.
  if (!code || !state || !expectedState || state !== expectedState) {
    return deny('Invalid OAuth state.', 400);
  }

  const redirectUri = `${url.origin}/api/studio/auth/callback`;
  const token = await exchangeCodeForToken(code, redirectUri);
  if (!token) return deny('OAuth exchange failed.', 502);

  const login = await fetchGitHubLogin(token);
  const allowedLogin = import.meta.env.GITHUB_ALLOWED_LOGIN;
  if (!login || !allowedLogin || login !== allowedLogin) {
    return deny('This studio is private. Your account is not authorized.', 403);
  }

  cookies.set(SESSION_COOKIE, await createSessionJWE({ login, token }), sessionCookieOptions());
  return redirect('/studio');
};
