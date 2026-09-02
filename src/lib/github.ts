import { GITHUB_SNAPSHOT } from './github-snapshot';

export interface ContributionDay {
  date: string;
  level: number;
  text: string;
}

export interface ContributionMonth {
  label: string;
  colSpan: number;
}

export interface ContributionRow {
  dayOfWeek: number;
  label: string;
  isVisibleLabel: boolean;
  days: ContributionDay[];
}

export interface ContributionsData {
  totalContributions: string;
  months: ContributionMonth[];
  rows: ContributionRow[];
  updatedAt: string;
  isLive?: boolean;
}

export interface MergedPr {
  id: number;
  number: number;
  title: string;
  url: string;
  repo: string;
  repo_owner: string;
  repo_name: string;
  merged_at: string;
}

export interface PrsData {
  total_count: number;
  page: number;
  per_page: number;
  total_pages: number;
  type: 'community' | 'all';
  prs: MergedPr[];
  updatedAt: string;
  isLive?: boolean;
}

// In-memory cache for serverless invocation reuse
let cachedContributions: { data: ContributionsData; expiresAt: number } | null = null;
const prsCache = new Map<string, { data: PrsData; expiresAt: number }>();

const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

// Accounts/orgs owned by the site author — PRs to these repos are not community contributions
const OWN_ACCOUNTS = ['Atharva-Kanherkar', 'agentclash'];

export async function fetchContributions(
  username = 'Atharva-Kanherkar',
  forceRefresh = false,
): Promise<ContributionsData> {
  const now = Date.now();
  if (!forceRefresh && cachedContributions && cachedContributions.expiresAt > now) {
    return cachedContributions.data;
  }

  try {
    const url = `https://github.com/users/${encodeURIComponent(username)}/contributions`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; PortfolioContributions/1.0)',
        Accept: 'text/html',
      },
    });

    if (!res.ok) {
      throw new Error(`GitHub returned status ${res.status}`);
    }

    const html = await res.text();
    const totalMatch = html.match(/([\d,]+)\s+contributions\s+(?:in\s+the\s+last\s+year|in\s+\d{4})/i);
    const total = totalMatch ? totalMatch[1] : GITHUB_SNAPSHOT.contributions.totalContributions;

    const rowMatches = html.match(/<tr[\s\S]*?<\/tr>/g) || [];
    if (rowMatches.length < 8) {
      throw new Error('Unexpected table structure in GitHub contributions HTML');
    }

    const monthLabels: ContributionMonth[] = [];
    const monthCellRegex =
      /<td class="ContributionCalendar-label"[^>]*colspan="(\d+)"[^>]*>[\s\S]*?<span aria-hidden="true"[^>]*>([^<]+)<\/span>/g;
    let mm: RegExpExecArray | null;
    while ((mm = monthCellRegex.exec(rowMatches[0])) !== null) {
      monthLabels.push({ colSpan: parseInt(mm[1], 10), label: mm[2].trim() });
    }

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const rows: ContributionRow[] = [];
    for (let r = 1; r <= 7; r++) {
      const rowHtml = rowMatches[r];
      const isVisibleLabel = r === 2 || r === 4 || r === 6; // Mon, Wed, Fri
      const label = dayNames[r - 1];
      const cellRegex =
        /<td[^>]*data-date="([^"]+)"[^>]*data-level="([0-4])"[^>]*>[\s\S]*?<tool-tip[^>]*>([^<]+)<\/tool-tip>/g;
      let cm: RegExpExecArray | null;
      const days: ContributionDay[] = [];
      while ((cm = cellRegex.exec(rowHtml)) !== null) {
        days.push({
          date: cm[1],
          level: parseInt(cm[2], 10),
          text: cm[3].trim(),
        });
      }
      rows.push({ dayOfWeek: r - 1, label, isVisibleLabel, days });
    }

    const result: ContributionsData = {
      totalContributions: total,
      months: monthLabels.length > 0 ? monthLabels : (GITHUB_SNAPSHOT.contributions.months as ContributionMonth[]),
      rows,
      updatedAt: new Date().toISOString(),
      isLive: true,
    };

    cachedContributions = { data: result, expiresAt: now + CACHE_TTL_MS };
    return result;
  } catch (error) {
    console.error('Failed to fetch live GitHub contributions:', error);
    if (cachedContributions) return cachedContributions.data;

    return {
      totalContributions: GITHUB_SNAPSHOT.contributions.totalContributions,
      months: GITHUB_SNAPSHOT.contributions.months as ContributionMonth[],
      rows: GITHUB_SNAPSHOT.contributions.rows as ContributionRow[],
      updatedAt: GITHUB_SNAPSHOT.contributions.updatedAt,
      isLive: false,
    };
  }
}

export async function fetchMergedPrs(options?: {
  type?: 'community' | 'all';
  page?: number;
  per_page?: number;
  forceRefresh?: boolean;
}): Promise<PrsData> {
  const type = options?.type ?? 'community';
  const page = Math.max(1, options?.page ?? 1);
  const per_page = Math.min(50, Math.max(1, options?.per_page ?? 10));
  const forceRefresh = options?.forceRefresh ?? false;

  const cacheKey = `${type}-${page}-${per_page}`;
  const now = Date.now();
  const cached = prsCache.get(cacheKey);
  if (!forceRefresh && cached && cached.expiresAt > now) {
    return cached.data;
  }

  const query =
    type === 'community'
      ? `author:Atharva-Kanherkar type:pr is:merged ${OWN_ACCOUNTS.map((a) => `-user:${a}`).join(' ')}`
      : 'author:Atharva-Kanherkar type:pr is:merged';

  const headers: Record<string, string> = {
    'User-Agent': 'portfolio-site',
    Accept: 'application/vnd.github.v3+json',
  };

  const token = typeof process !== 'undefined' ? process.env?.GITHUB_TOKEN : undefined;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const searchUrl = `https://api.github.com/search/issues?q=${encodeURIComponent(query)}&sort=updated&order=desc&per_page=${per_page}&page=${page}`;
    const res = await fetch(searchUrl, { headers });

    if (!res.ok) {
      throw new Error(`GitHub search API returned status ${res.status}`);
    }

    const json = await res.json();
    const total_count = json.total_count ?? 0;
    const total_pages = Math.max(1, Math.ceil(total_count / per_page));

    interface GhItem {
      id: number;
      number: number;
      title: string;
      html_url: string;
      repository_url: string;
      closed_at?: string;
      created_at?: string;
    }

    const prs: MergedPr[] = ((json.items as GhItem[]) || []).map((item) => {
      const parts = item.repository_url.split('/');
      const repo_owner = parts[parts.length - 2] ?? '';
      const repo_name = parts[parts.length - 1] ?? '';
      const repo = `${repo_owner}/${repo_name}`;

      return {
        id: item.id,
        number: item.number,
        title: item.title,
        url: item.html_url,
        repo,
        repo_owner,
        repo_name,
        merged_at: item.closed_at || item.created_at || new Date().toISOString(),
      };
    });

    const result: PrsData = {
      total_count,
      page,
      per_page,
      total_pages,
      type,
      prs,
      updatedAt: new Date().toISOString(),
      isLive: true,
    };

    prsCache.set(cacheKey, { data: result, expiresAt: now + CACHE_TTL_MS });
    return result;
  } catch (error) {
    console.error('Failed to fetch live GitHub PRs:', error);
    if (cached) return cached.data;

    // Use bundled snapshot data
    const snapshotGroup = type === 'community' ? GITHUB_SNAPSHOT.prs.community : GITHUB_SNAPSHOT.prs.all;
    const snapshotPrs =
      type === 'community'
        ? (snapshotGroup.prs as MergedPr[]).filter((pr) => !OWN_ACCOUNTS.includes(pr.repo_owner))
        : (snapshotGroup.prs as MergedPr[]);
    const removedCount = (snapshotGroup.prs as MergedPr[]).length - snapshotPrs.length;
    const total_count = Math.max(0, snapshotGroup.total_count - removedCount);
    const total_pages = Math.max(1, Math.ceil(total_count / per_page));
    const startIndex = (page - 1) * per_page;
    const pagedPrs = snapshotPrs.slice(startIndex, startIndex + per_page);

    return {
      total_count,
      page,
      per_page,
      total_pages,
      type,
      prs: pagedPrs,
      updatedAt: snapshotGroup.updatedAt,
      isLive: false,
    };
  }
}
