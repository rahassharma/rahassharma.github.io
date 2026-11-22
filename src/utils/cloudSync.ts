import {
  CLOUD_PUBLIC_CONFIG,
  CloudProvider,
  CloudPublicConfig,
} from '../config/cloudConfig';
import { HonorItem, Project, Publication, SiteProfile } from '../data/siteData';

export interface SectionVisibility {
  mission: boolean;
  publications: boolean;
  projects: boolean;
  honors: boolean;
}

export interface SiteSnapshot {
  version: number;
  updatedAt: string;
  profile: SiteProfile;
  publications: Publication[];
  projects: Project[];
  honors: HonorItem[];
  theme: 'light' | 'dark';
  visibility: SectionVisibility;
}

export interface AdminCloudSettings extends CloudPublicConfig {
  githubToken: string;
  firebaseAuthSecret: string;
  lastPublishedAt: string | null;
}

export interface PublicReadTestResult {
  ok: boolean;
  httpStatus?: number;
  endpoint?: string;
  updatedAt?: string;
  bakedIntoBuild: boolean;
  message: string;
}

const ADMIN_CLOUD_STORAGE_KEY = 'rahas_admin_cloud_settings_v1';

export function loadAdminCloudSettings(): AdminCloudSettings {
  const defaults: AdminCloudSettings = {
    ...CLOUD_PUBLIC_CONFIG,
    provider:
      CLOUD_PUBLIC_CONFIG.provider === 'none'
        ? 'firebase'
        : CLOUD_PUBLIC_CONFIG.provider,
    githubToken: '',
    firebaseAuthSecret: '',
    lastPublishedAt: null,
  };
  try {
    const raw = localStorage.getItem(ADMIN_CLOUD_STORAGE_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw);
    return {
      ...defaults,
      ...parsed,
      provider:
        CLOUD_PUBLIC_CONFIG.provider !== 'none'
          ? CLOUD_PUBLIC_CONFIG.provider
          : parsed.provider || defaults.provider,
      firebaseUrl:
        parsed.firebaseUrl?.trim() || CLOUD_PUBLIC_CONFIG.firebaseUrl,
    };
  } catch {
    return defaults;
  }
}

export function saveAdminCloudSettings(settings: AdminCloudSettings): void {
  try {
    localStorage.setItem(ADMIN_CLOUD_STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // ignore storage quota errors
  }
}

export function isConfigBakedIntoBuild(): boolean {
  return (
    CLOUD_PUBLIC_CONFIG.provider !== 'none' &&
    ((CLOUD_PUBLIC_CONFIG.provider === 'github-gist' &&
      Boolean(CLOUD_PUBLIC_CONFIG.gistId.trim())) ||
      (CLOUD_PUBLIC_CONFIG.provider === 'github-repo' &&
        Boolean(CLOUD_PUBLIC_CONFIG.githubOwner.trim()) &&
        Boolean(CLOUD_PUBLIC_CONFIG.githubRepo.trim())) ||
      (CLOUD_PUBLIC_CONFIG.provider === 'firebase' &&
        Boolean(CLOUD_PUBLIC_CONFIG.firebaseUrl.trim())))
  );
}

export function getEffectivePublicConfig(): CloudPublicConfig {
  if (isConfigBakedIntoBuild()) {
    return CLOUD_PUBLIC_CONFIG;
  }

  // Allow checking URL query param ?fb=... for instant testing across devices
  try {
    const params = new URLSearchParams(window.location.search);
    const fbParam = params.get('fb');
    if (fbParam && fbParam.startsWith('https://')) {
      return {
        ...CLOUD_PUBLIC_CONFIG,
        provider: 'firebase',
        firebaseUrl: fbParam,
      };
    }
  } catch {
    // ignore
  }

  // Allow an admin testing locally to also pull from their configured provider
  try {
    const raw = localStorage.getItem(ADMIN_CLOUD_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<AdminCloudSettings>;
      if (
        (parsed.provider === 'github-gist' && parsed.gistId) ||
        (parsed.provider === 'github-repo' &&
          parsed.githubOwner &&
          parsed.githubRepo) ||
        (parsed.provider === 'firebase' && parsed.firebaseUrl)
      ) {
        return {
          provider: parsed.provider,
          gistId: parsed.gistId || '',
          gistFilename: parsed.gistFilename || CLOUD_PUBLIC_CONFIG.gistFilename,
          githubOwner: parsed.githubOwner || CLOUD_PUBLIC_CONFIG.githubOwner,
          githubRepo: parsed.githubRepo || '',
          githubBranch: parsed.githubBranch || 'main',
          githubFilePath:
            parsed.githubFilePath || CLOUD_PUBLIC_CONFIG.githubFilePath,
          firebaseUrl: parsed.firebaseUrl || '',
        };
      }
    }
  } catch {
    // ignore
  }
  return CLOUD_PUBLIC_CONFIG;
}

/**
 * Firebase RTDB can convert sparse arrays into numeric-keyed objects and strips empty arrays.
 * This normalizes both arrays and object-maps back into clean JS arrays.
 */
function toArray<T>(val: unknown): T[] | undefined {
  if (Array.isArray(val)) return val.filter((item) => item !== null && item !== undefined) as T[];
  if (val && typeof val === 'object') {
    const entries = Object.entries(val as Record<string, T>);
    if (entries.length === 0) return [];
    const allNumeric = entries.every(([k]) => /^\d+$/.test(k));
    if (allNumeric) {
      return entries
        .sort(([a], [b]) => Number(a) - Number(b))
        .map(([, v]) => v)
        .filter((item) => item !== null && item !== undefined);
    }
  }
  return undefined;
}

function normalizeSnapshot(raw: unknown): Partial<SiteSnapshot> | null {
  if (!raw || typeof raw !== 'object') return null;
  const obj = raw as Record<string, unknown>;
  if (!obj.profile && !obj.publications && !obj.projects && !obj.honors) {
    return null;
  }

  const normalized: Partial<SiteSnapshot> = {
    version: typeof obj.version === 'number' ? obj.version : 1,
    updatedAt: typeof obj.updatedAt === 'string' ? obj.updatedAt : undefined,
    theme: obj.theme === 'dark' || obj.theme === 'light' ? obj.theme : undefined,
    visibility:
      obj.visibility && typeof obj.visibility === 'object'
        ? (obj.visibility as SectionVisibility)
        : undefined,
  };

  if (obj.profile && typeof obj.profile === 'object') {
    const p = obj.profile as Record<string, unknown>;
    const rawFonts =
      p.fonts && typeof p.fonts === 'object'
        ? (p.fonts as Record<string, unknown>)
        : undefined;
    normalized.profile = {
      ...(p as unknown as SiteProfile),
      savedColorPresets: toArray(p.savedColorPresets) ?? [],
      socialLinks: toArray(p.socialLinks) ?? [],
      philosophyPillars: toArray(p.philosophyPillars) ?? [],
      demographicsServed: toArray(p.demographicsServed) ?? [],
      ...(rawFonts
        ? {
            fonts: {
              headings:
                typeof rawFonts.headings === 'string'
                  ? rawFonts.headings
                  : 'instrument-serif',
              body:
                typeof rawFonts.body === 'string'
                  ? rawFonts.body
                  : 'plus-jakarta-sans',
              buttons:
                typeof rawFonts.buttons === 'string'
                  ? rawFonts.buttons
                  : 'plus-jakarta-sans',
              nav:
                typeof rawFonts.nav === 'string'
                  ? rawFonts.nav
                  : 'plus-jakarta-sans',
              mono:
                typeof rawFonts.mono === 'string'
                  ? rawFonts.mono
                  : 'jetbrains-mono',
              uploadedFonts: toArray(rawFonts.uploadedFonts) ?? [],
            },
          }
        : {}),
    };
  }

  const pubs = toArray<Publication>(obj.publications);
  if (pubs) {
    normalized.publications = pubs.map((pub) => ({
      ...pub,
      tags: toArray<string>(pub.tags) ?? [],
    }));
  }

  const projs = toArray<Project>(obj.projects);
  if (projs) {
    normalized.projects = projs.map((proj) => ({
      ...proj,
      specs: toArray(proj.specs) ?? [],
      outcomes: toArray(proj.outcomes) ?? [],
      stack: toArray<string>(proj.stack) ?? [],
    }));
  }

  const honors = toArray<HonorItem>(obj.honors);
  if (honors) {
    normalized.honors = honors;
  }

  return normalized;
}

export function normalizeFirebaseUrl(rawUrl: string): string {
  // Strip any accidental query strings like ?auth=... before normalizing path
  const withoutQuery = rawUrl.trim().split('?')[0].replace(/\/+$/, '');
  return withoutQuery.endsWith('.json') ? withoutQuery : `${withoutQuery}/site.json`;
}

/**
 * Fetches the latest worldwide published site data for all visitors.
 */
export async function fetchWorldwideSiteData(
  config: CloudPublicConfig
): Promise<Partial<SiteSnapshot> | null> {
  try {
    if (config.provider === 'github-gist' && config.gistId.trim()) {
      const res = await fetch(
        `https://api.github.com/gists/${encodeURIComponent(config.gistId.trim())}`,
        {
          headers: { Accept: 'application/vnd.github+json' },
          cache: 'no-store',
        }
      );
      if (res.ok) {
        const gist = await res.json();
        const files = gist?.files || {};
        const fileEntry =
          files[config.gistFilename] || Object.values(files)[0];
        if (fileEntry && typeof fileEntry.content === 'string') {
          const parsed = normalizeSnapshot(JSON.parse(fileEntry.content));
          if (parsed) return parsed;
        }
      }
    } else if (
      config.provider === 'github-repo' &&
      config.githubOwner.trim() &&
      config.githubRepo.trim()
    ) {
      const owner = encodeURIComponent(config.githubOwner.trim());
      const repo = encodeURIComponent(config.githubRepo.trim());
      const branch = encodeURIComponent(config.githubBranch.trim() || 'main');
      const path = config.githubFilePath.replace(/^\/+/, '');
      const res = await fetch(
        `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}?t=${Date.now()}`,
        { cache: 'no-store' }
      );
      if (res.ok) {
        const parsed = normalizeSnapshot(await res.json());
        if (parsed) return parsed;
      }
    } else if (config.provider === 'firebase' && config.firebaseUrl.trim()) {
      // IMPORTANT: Do NOT append unknown query params like ?t= to Firebase RTDB —
      // Firebase rejects unknown query parameters with HTTP 400!
      const cleanUrl = normalizeFirebaseUrl(config.firebaseUrl);
      const res = await fetch(cleanUrl, { cache: 'no-store' });
      if (res.ok) {
        const parsed = normalizeSnapshot(await res.json());
        if (parsed) return parsed;
      }
    }
  } catch {
    // Fall through to static site-content.json fallback
  }

  // Fallback: check static ./site-content.json hosted alongside the site
  try {
    const res = await fetch(`./site-content.json?t=${Date.now()}`, {
      cache: 'no-store',
    });
    if (res.ok) {
      const text = await res.text();
      if (text.trim().startsWith('{')) {
        const parsed = normalizeSnapshot(JSON.parse(text));
        if (parsed) return parsed;
      }
    }
  } catch {
    // No static site-content.json present — use bundled defaults
  }

  return null;
}

/**
 * Tests unauthenticated public read exactly as a visitor from another device would.
 */
export async function testWorldwidePublicRead(
  config: CloudPublicConfig
): Promise<PublicReadTestResult> {
  const baked = isConfigBakedIntoBuild();

  try {
    if (config.provider === 'firebase') {
      if (!config.firebaseUrl.trim()) {
        return {
          ok: false,
          bakedIntoBuild: baked,
          message: 'Enter your Firebase Realtime Database URL first.',
        };
      }
      const cleanUrl = normalizeFirebaseUrl(config.firebaseUrl);
      const res = await fetch(cleanUrl, { cache: 'no-store' });
      if (res.status === 401 || res.status === 403) {
        return {
          ok: false,
          httpStatus: res.status,
          endpoint: cleanUrl,
          bakedIntoBuild: baked,
          message:
            'Firebase blocked anonymous public reads (HTTP 401/403). In Firebase Console → Realtime Database → Rules, make sure ".read": true is enabled so visitors worldwide can read your site.',
        };
      }
      if (!res.ok) {
        return {
          ok: false,
          httpStatus: res.status,
          endpoint: cleanUrl,
          bakedIntoBuild: baked,
          message: `Firebase returned HTTP ${res.status}. Double-check your RTDB URL.`,
        };
      }
      const data = await res.json();
      if (!data) {
        return {
          ok: false,
          httpStatus: res.status,
          endpoint: cleanUrl,
          bakedIntoBuild: baked,
          message:
            'Firebase endpoint is readable, but it is currently empty (null). Click "Publish Worldwide Now" first.',
        };
      }
      const snap = normalizeSnapshot(data);
      if (!snap) {
        return {
          ok: false,
          httpStatus: res.status,
          endpoint: cleanUrl,
          bakedIntoBuild: baked,
          message: 'Firebase returned data, but it does not look like a site snapshot.',
        };
      }
      return {
        ok: true,
        httpStatus: res.status,
        endpoint: cleanUrl,
        updatedAt: snap.updatedAt,
        bakedIntoBuild: baked,
        message: baked
          ? 'Public read succeeded AND your Firebase URL is baked into the site build — visitors worldwide see your live edits!'
          : 'Firebase public read succeeded! One final step: your Firebase URL is currently only saved on THIS device, not inside src/config/cloudConfig.ts yet — so other devices don’t know which Firebase URL to read from. Send me your Firebase URL or update src/config/cloudConfig.ts once to connect everyone worldwide.',
      };
    }

    if (config.provider === 'github-gist') {
      if (!config.gistId.trim()) {
        return {
          ok: false,
          bakedIntoBuild: baked,
          message: 'No Gist ID configured yet. Publish once to create it.',
        };
      }
      const endpoint = `https://api.github.com/gists/${encodeURIComponent(config.gistId.trim())}`;
      const res = await fetch(endpoint, { cache: 'no-store' });
      if (!res.ok) {
        return {
          ok: false,
          httpStatus: res.status,
          endpoint,
          bakedIntoBuild: baked,
          message: `GitHub Gist returned HTTP ${res.status}.`,
        };
      }
      return {
        ok: true,
        httpStatus: res.status,
        endpoint,
        bakedIntoBuild: baked,
        message: baked
          ? 'GitHub Gist is publicly readable AND connected in the site build!'
          : 'GitHub Gist is publicly readable! Remember to bake the Gist ID into src/config/cloudConfig.ts so other devices worldwide know where to read.',
      };
    }

    if (config.provider === 'github-repo') {
      const owner = encodeURIComponent(config.githubOwner.trim());
      const repo = encodeURIComponent(config.githubRepo.trim());
      const branch = encodeURIComponent(config.githubBranch.trim() || 'main');
      const path = config.githubFilePath.replace(/^\/+/, '');
      const endpoint = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`;
      const res = await fetch(`${endpoint}?t=${Date.now()}`, { cache: 'no-store' });
      if (!res.ok) {
        return {
          ok: false,
          httpStatus: res.status,
          endpoint,
          bakedIntoBuild: baked,
          message: `Raw GitHub file returned HTTP ${res.status}.`,
        };
      }
      return {
        ok: true,
        httpStatus: res.status,
        endpoint,
        bakedIntoBuild: baked,
        message: 'GitHub repository JSON file is publicly readable worldwide!',
      };
    }

    return {
      ok: false,
      bakedIntoBuild: baked,
      message: 'No cloud provider selected.',
    };
  } catch (err) {
    return {
      ok: false,
      bakedIntoBuild: baked,
      message:
        err instanceof Error
          ? `Network error testing public read: ${err.message}`
          : 'Network error testing public read.',
    };
  }
}

function utf8ToBase64(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }
  return btoa(binary);
}

/**
 * Publishes snapshot to a public GitHub Gist (creates one if gistId is empty).
 */
export async function publishToGitHubGist(params: {
  gistId: string;
  filename: string;
  token: string;
  snapshot: SiteSnapshot;
}): Promise<{ gistId: string; htmlUrl: string; created: boolean }> {
  const token = params.token.trim();
  if (!token) {
    throw new Error('Please enter your GitHub Personal Access Token (with gist scope).');
  }

  const filename = params.filename.trim() || 'rahas-site-content.json';
  const content = JSON.stringify(params.snapshot, null, 2);
  const existingId = params.gistId.trim();

  const url = existingId
    ? `https://api.github.com/gists/${encodeURIComponent(existingId)}`
    : 'https://api.github.com/gists';

  const res = await fetch(url, {
    method: existingId ? 'PATCH' : 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      description: `${params.snapshot.profile.name} — Live Website Content`,
      ...(existingId ? {} : { public: true }),
      files: {
        [filename]: { content },
      },
    }),
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(
      errBody?.message || `GitHub Gist publish failed (HTTP ${res.status}).`
    );
  }

  const data = await res.json();
  return {
    gistId: data.id,
    htmlUrl: data.html_url,
    created: !existingId,
  };
}

/**
 * Commits a UTF-8 text file directly into a GitHub repository via Contents API.
 */
export async function commitFileToGitHubRepo(params: {
  owner: string;
  repo: string;
  branch: string;
  filePath: string;
  token: string;
  content: string;
  commitMessage: string;
}): Promise<{ commitUrl: string }> {
  const owner = params.owner.trim();
  const repo = params.repo.trim();
  const branch = params.branch.trim() || 'main';
  const filePath = params.filePath.trim().replace(/^\/+/, '');
  const token = params.token.trim();

  if (!owner || !repo) {
    throw new Error('Please enter both GitHub Owner and Repository Name.');
  }
  if (!token) {
    throw new Error('Please enter your GitHub Personal Access Token (with repo/contents write scope).');
  }

  const apiBase = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${filePath
    .split('/')
    .map(encodeURIComponent)
    .join('/')}`;

  let existingSha: string | undefined;
  const checkRes = await fetch(`${apiBase}?ref=${encodeURIComponent(branch)}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
    },
  });
  if (checkRes.ok) {
    const existing = await checkRes.json();
    existingSha = existing?.sha;
  }

  const putRes = await fetch(apiBase, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: params.commitMessage,
      content: utf8ToBase64(params.content),
      branch,
      ...(existingSha ? { sha: existingSha } : {}),
    }),
  });

  if (!putRes.ok) {
    const errBody = await putRes.json().catch(() => ({}));
    throw new Error(
      errBody?.message || `GitHub commit failed (HTTP ${putRes.status}).`
    );
  }

  const data = await putRes.json();
  return {
    commitUrl: data?.commit?.html_url || `https://github.com/${owner}/${repo}`,
  };
}

/**
 * Publishes snapshot directly to Firebase Realtime Database via REST PUT.
 */
export async function publishToFirebase(params: {
  firebaseUrl: string;
  authSecret: string;
  snapshot: SiteSnapshot;
}): Promise<{ endpoint: string }> {
  if (!params.firebaseUrl.trim()) {
    throw new Error('Please enter your Firebase Realtime Database URL.');
  }
  const cleanUrl = normalizeFirebaseUrl(params.firebaseUrl);
  const endpoint = params.authSecret.trim()
    ? `${cleanUrl}?auth=${encodeURIComponent(params.authSecret.trim())}`
    : cleanUrl;

  const res = await fetch(endpoint, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params.snapshot),
  });

  if (!res.ok) {
    throw new Error(
      `Firebase publish failed (HTTP ${res.status}). Check your database rules or auth secret.`
    );
  }

  return { endpoint: cleanUrl };
}

/**
 * Generates the exact public src/config/cloudConfig.ts content (zero secrets)
 * so global visitors automatically read from your chosen cloud source.
 */
export function generateCloudConfigSnippet(
  provider: CloudProvider,
  settings: CloudPublicConfig
): string {
  const esc = (v: string) => v.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  return `export type CloudProvider = 'none' | 'github-gist' | 'github-repo' | 'firebase';

export interface CloudPublicConfig {
  provider: CloudProvider;
  gistId: string;
  gistFilename: string;
  githubOwner: string;
  githubRepo: string;
  githubBranch: string;
  githubFilePath: string;
  firebaseUrl: string;
}

export const CLOUD_PUBLIC_CONFIG: CloudPublicConfig = {
  provider: '${provider}',
  gistId: '${esc(settings.gistId.trim())}',
  gistFilename: '${esc(settings.gistFilename.trim() || 'rahas-site-content.json')}',
  githubOwner: '${esc(settings.githubOwner.trim())}',
  githubRepo: '${esc(settings.githubRepo.trim())}',
  githubBranch: '${esc(settings.githubBranch.trim() || 'main')}',
  githubFilePath: '${esc(settings.githubFilePath.trim() || 'public/site-content.json')}',
  firebaseUrl: '${esc(settings.firebaseUrl.trim())}',
};
`;
}
