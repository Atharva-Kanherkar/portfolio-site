const GH_AUTHORIZE = 'https://github.com/login/oauth/authorize';
const GH_TOKEN = 'https://github.com/login/oauth/access_token';
const GH_USER = 'https://api.github.com/user';

/** Build the GitHub authorize URL. Scope `public_repo` is the narrowest that can commit to a public repo. */
export function getAuthorizeUrl(state: string, redirectUri: string): string {
  const params = new URLSearchParams({
    client_id: import.meta.env.GITHUB_CLIENT_ID,
    redirect_uri: redirectUri,
    scope: 'public_repo',
    state,
    allow_signup: 'false',
  });
  return `${GH_AUTHORIZE}?${params.toString()}`;
}

export async function exchangeCodeForToken(code: string, redirectUri: string): Promise<string | null> {
  const res = await fetch(GH_TOKEN, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      client_id: import.meta.env.GITHUB_CLIENT_ID,
      client_secret: import.meta.env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: redirectUri,
    }),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { access_token?: string };
  return typeof data.access_token === 'string' ? data.access_token : null;
}

export async function fetchGitHubLogin(token: string): Promise<string | null> {
  const res = await fetch(GH_USER, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'atharva-studio',
    },
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { login?: string };
  return typeof data.login === 'string' ? data.login : null;
}
