import type { APIRoute } from 'astro';
import { SESSION_COOKIE } from '@studio/session';

export const prerender = false;

const clear: APIRoute = ({ cookies, redirect }) => {
  cookies.delete(SESSION_COOKIE, { path: '/' });
  return redirect('/studio/login');
};

export const POST = clear;
export const GET = clear;
