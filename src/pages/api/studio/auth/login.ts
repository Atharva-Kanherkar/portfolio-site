import type { APIRoute } from 'astro';
import { getAuthorizeUrl } from '@studio/github-oauth';
import { OAUTH_STATE_COOKIE, shortLivedCookieOptions } from '@studio/session';

export const prerender = false;

export const GET: APIRoute = ({ url, cookies, redirect }) => {
  const state = crypto.randomUUID();
  cookies.set(OAUTH_STATE_COOKIE, state, shortLivedCookieOptions());
  const redirectUri = `${url.origin}/api/studio/auth/callback`;
  return redirect(getAuthorizeUrl(state, redirectUri));
};
