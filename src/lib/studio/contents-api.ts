const API = 'https://api.github.com';

function repo() {
  return {
    owner: import.meta.env.GITHUB_REPO_OWNER ?? 'Atharva-Kanherkar',
    name: import.meta.env.GITHUB_REPO_NAME ?? 'portfolio-site',
    branch: import.meta.env.GITHUB_REPO_BRANCH ?? 'master',
  };
}

function headers(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'atharva-studio',
  };
}

/** Returns the blob SHA for a path, or null if it doesn't exist (needed to update a file). */
export async function getFileSha(token: string, path: string): Promise<string | null> {
  const { owner, name, branch } = repo();
  const res = await fetch(`${API}/repos/${owner}/${name}/contents/${encodeURI(path)}?ref=${branch}`, {
    headers: headers(token),
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub getFile ${res.status}`);
  const data = (await res.json()) as { sha?: string };
  return data.sha ?? null;
}

export interface PutResult {
  path: string;
  commit: string;
}

/** Create or update a file via the Contents API. Pass `sha` to update an existing file. */
export async function putFile(
  token: string,
  path: string,
  content: string,
  message: string,
  sha?: string,
): Promise<PutResult> {
  const { owner, name, branch } = repo();
  const body = {
    message,
    content: Buffer.from(content, 'utf-8').toString('base64'),
    branch,
    ...(sha ? { sha } : {}),
  };
  const res = await fetch(`${API}/repos/${owner}/${name}/contents/${encodeURI(path)}`, {
    method: 'PUT',
    headers: { ...headers(token), 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub putFile ${res.status}: ${text.slice(0, 200)}`);
  }
  const data = (await res.json()) as { commit?: { sha?: string } };
  return { path, commit: data.commit?.sha ?? '' };
}
