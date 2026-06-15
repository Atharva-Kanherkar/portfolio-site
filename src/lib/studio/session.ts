import { EncryptJWT, jwtDecrypt } from 'jose';

export const SESSION_COOKIE = 'studio_session';
export const OAUTH_STATE_COOKIE = 'studio_oauth_state';
const MAX_AGE_SECONDS = 60 * 60 * 12; // 12 hours

export interface SessionData {
  /** GitHub login of the authenticated owner. */
  login: string;
  /** GitHub OAuth access token (gho_…) — used to commit posts. */
  token: string;
}

function getKey(): Uint8Array {
  const secret = import.meta.env.SESSION_SECRET;
  if (!secret) throw new Error('SESSION_SECRET is not set');
  const key = new Uint8Array(Buffer.from(secret, 'base64'));
  if (key.length !== 32) {
    throw new Error('SESSION_SECRET must decode to 32 bytes — generate with `openssl rand -base64 32`');
  }
  return key;
}

/** Encrypt the session (JWE, A256GCM) so the carried OAuth token is unreadable client-side. */
export async function createSessionJWE(data: SessionData): Promise<string> {
  return await new EncryptJWT({ login: data.login, token: data.token })
    .setProtectedHeader({ alg: 'dir', enc: 'A256GCM' })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .encrypt(getKey());
}

export async function readSessionJWE(jwe: string | undefined): Promise<SessionData | null> {
  if (!jwe) return null;
  try {
    const { payload } = await jwtDecrypt(jwe, getKey());
    if (typeof payload.login === 'string' && typeof payload.token === 'string') {
      return { login: payload.login, token: payload.token };
    }
    return null;
  } catch {
    return null;
  }
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: import.meta.env.PROD,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: MAX_AGE_SECONDS,
  };
}

export function shortLivedCookieOptions() {
  return {
    httpOnly: true,
    secure: import.meta.env.PROD,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 600,
  };
}
