import React, { useState } from 'react';
import {
  Check,
  Cloud,
  CloudUpload,
  Copy,
  Download,
  ExternalLink,
  Eye,
  EyeOff,
  Globe,
  RefreshCw,
  ShieldAlert,
} from 'lucide-react';
import { CloudProvider } from '../config/cloudConfig';
import {
  AdminCloudSettings,
  PublicReadTestResult,
  SiteSnapshot,
  commitFileToGitHubRepo,
  generateCloudConfigSnippet,
  isConfigBakedIntoBuild,
  loadAdminCloudSettings,
  publishToFirebase,
  publishToGitHubGist,
  saveAdminCloudSettings,
  testWorldwidePublicRead,
} from '../utils/cloudSync';

interface PublishTabProps {
  snapshot: SiteSnapshot;
  hasUnpublishedChanges: boolean;
  onPublished: (timestamp: string) => void;
  onPullLive: () => Promise<boolean>;
}

const inputCls =
  'w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none';
const labelCls =
  'block font-mono-meta text-[10px] uppercase tracking-[0.14em] text-[var(--text-muted)]';

const PROVIDERS: {
  id: Exclude<CloudProvider, 'none'>;
  title: string;
  subtitle: string;
}[] = [
  {
    id: 'github-gist',
    title: 'GitHub Gist',
    subtitle: 'Free · Instant worldwide · 1-click create',
  },
  {
    id: 'github-repo',
    title: 'GitHub Repo',
    subtitle: 'Auto-commits public/site-content.json',
  },
  {
    id: 'firebase',
    title: 'Firebase RTDB',
    subtitle: 'Free · <1 second worldwide sync',
  },
];

export const PublishTab: React.FC<PublishTabProps> = ({
  snapshot,
  hasUnpublishedChanges,
  onPublished,
  onPullLive,
}) => {
  const [settings, setSettings] = useState<AdminCloudSettings>(() =>
    loadAdminCloudSettings()
  );
  const [showSecret, setShowSecret] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [pulling, setPulling] = useState(false);
  const [testingRead, setTestingRead] = useState(false);
  const [readTestResult, setReadTestResult] =
    useState<PublicReadTestResult | null>(null);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
    link?: string;
  } | null>(null);
  const [copiedConfig, setCopiedConfig] = useState(false);

  const updateSettings = (patch: Partial<AdminCloudSettings>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    saveAdminCloudSettings(next);
  };

  const activeProvider: Exclude<CloudProvider, 'none'> =
    settings.provider === 'none' ? 'github-gist' : settings.provider;

  const isPublicConfigBakedIn = isConfigBakedIntoBuild();

  const handleTestPublicRead = async () => {
    setTestingRead(true);
    setReadTestResult(null);
    const result = await testWorldwidePublicRead({
      ...settings,
      provider: activeProvider,
    });
    setReadTestResult(result);
    setTestingRead(false);
  };

  const handlePublish = async () => {
    setPublishing(true);
    setStatusMessage(null);
    const now = new Date().toISOString();
    const payload: SiteSnapshot = { ...snapshot, updatedAt: now };

    try {
      if (activeProvider === 'github-gist') {
        const res = await publishToGitHubGist({
          gistId: settings.gistId,
          filename: settings.gistFilename,
          token: settings.githubToken,
          snapshot: payload,
        });
        updateSettings({ gistId: res.gistId, lastPublishedAt: now });
        onPublished(now);
        setStatusMessage({
          type: 'success',
          text: res.created
            ? `Created new public Gist (${res.gistId}) and published your site! Copy the 1-time cloudConfig.ts snippet below so all global visitors read from this Gist.`
            : 'Published live to your GitHub Gist! All visitors worldwide now receive your latest edits.',
          link: res.htmlUrl,
        });
      } else if (activeProvider === 'github-repo') {
        const res = await commitFileToGitHubRepo({
          owner: settings.githubOwner,
          repo: settings.githubRepo,
          branch: settings.githubBranch,
          filePath: settings.githubFilePath || 'public/site-content.json',
          token: settings.githubToken,
          content: JSON.stringify(payload, null, 2),
          commitMessage: `Update site content (${new Date().toLocaleString()})`,
        });
        updateSettings({ lastPublishedAt: now });
        onPublished(now);
        setStatusMessage({
          type: 'success',
          text: 'Committed public/site-content.json directly to GitHub! Your live site updates worldwide automatically.',
          link: res.commitUrl,
        });
      } else if (activeProvider === 'firebase') {
        const res = await publishToFirebase({
          firebaseUrl: settings.firebaseUrl,
          authSecret: settings.firebaseAuthSecret,
          snapshot: payload,
        });
        updateSettings({ lastPublishedAt: now });
        onPublished(now);
        setStatusMessage({
          type: 'success',
          text: `Published live to Firebase (${res.endpoint})! Every visitor worldwide sees the changes immediately.`,
        });
      }
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text:
          err instanceof Error
            ? err.message
            : 'Publishing failed. Check your connection and credentials.',
      });
    } finally {
      setPublishing(false);
    }
  };

  const handleCommitConfigToRepo = async () => {
    setPublishing(true);
    setStatusMessage(null);
    try {
      const code = generateCloudConfigSnippet(activeProvider, settings);
      const res = await commitFileToGitHubRepo({
        owner: settings.githubOwner,
        repo: settings.githubRepo,
        branch: settings.githubBranch,
        filePath: 'src/config/cloudConfig.ts',
        token: settings.githubToken,
        content: code,
        commitMessage: 'Connect worldwide cloud sync config',
      });
      setStatusMessage({
        type: 'success',
        text: 'Committed src/config/cloudConfig.ts to your GitHub repo! Once deployed, all global visitors will sync automatically.',
        link: res.commitUrl,
      });
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text:
          err instanceof Error
            ? err.message
            : 'Could not commit src/config/cloudConfig.ts.',
      });
    } finally {
      setPublishing(false);
    }
  };

  const handleDownloadStaticFile = () => {
    const payload: SiteSnapshot = {
      ...snapshot,
      updatedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'site-content.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyConfigSnippet = async () => {
    const snippet = generateCloudConfigSnippet(activeProvider, settings);
    try {
      await navigator.clipboard.writeText(snippet);
      setCopiedConfig(true);
      setTimeout(() => setCopiedConfig(false), 2200);
    } catch {
      // ignore
    }
  };

  const handlePull = async () => {
    setPulling(true);
    setStatusMessage(null);
    const ok = await onPullLive();
    setPulling(false);
    setStatusMessage(
      ok
        ? {
            type: 'success',
            text: 'Reloaded the latest live worldwide version from the cloud.',
          }
        : {
            type: 'error',
            text: 'No live cloud file found yet. Publish once first to create it.',
          }
    );
  };

  const configSnippet = generateCloudConfigSnippet(activeProvider, settings);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-serif-display text-2xl text-[var(--text)]">
          Publish Worldwide
        </h3>
        <p className="mt-1 text-xs leading-relaxed text-[var(--text-muted)]">
          Edits you make in Admin Studio save immediately as a local draft on
          this device. Publish them to a free cloud backend below so every
          visitor worldwide sees your updated website.
        </p>
      </div>

      {/* Honest Live Status Card */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
        <div className="flex items-start gap-3">
          <span
            className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
              hasUnpublishedChanges
                ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300'
                : 'bg-[var(--accent-soft)] text-[var(--accent)]'
            }`}
          >
            <Globe className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-semibold text-[var(--text)]">
              {hasUnpublishedChanges
                ? 'Unpublished local edits on this device'
                : 'Synced with latest published version'}
            </p>
            <p className="mt-0.5 font-mono-meta text-[11px] text-[var(--text-muted)]">
              {settings.lastPublishedAt
                ? `Last published: ${new Date(settings.lastPublishedAt).toLocaleString()}`
                : 'Not published to cloud yet — currently device-only'}
            </p>
          </div>
        </div>

        <button
          type="button"
          disabled={pulling}
          onClick={handlePull}
          className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--bg)] px-3.5 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--text)] disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${pulling ? 'animate-spin' : ''}`} />
          <span>{pulling ? 'Pulling...' : 'Pull Live Version'}</span>
        </button>
      </div>

      {/* Choose Free Worldwide Sync Provider */}
      <div>
        <p className={labelCls}>Choose Free Worldwide Backend</p>
        <div className="mt-2.5 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          {PROVIDERS.map((p) => {
            const active = activeProvider === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => updateSettings({ provider: p.id })}
                className={`rounded-xl border p-3.5 text-left transition-all cursor-pointer ${
                  active
                    ? 'border-[var(--accent)] bg-[var(--surface)]'
                    : 'border-[var(--border)] bg-[var(--surface)]/40 hover:border-[var(--border-strong)]'
                }`}
              >
                <p className="flex items-center justify-between text-xs font-semibold text-[var(--text)]">
                  <span>{p.title}</span>
                  {active && <Check className="h-3.5 w-3.5 text-[var(--accent)]" />}
                </p>
                <p className="mt-1 text-[11px] text-[var(--text-muted)]">
                  {p.subtitle}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Provider Form */}
      <div className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/60 p-4 sm:p-5">
        {activeProvider === 'github-gist' && (
          <>
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              <div>
                <label className={labelCls}>
                  GitHub Gist ID (leave blank to auto-create)
                </label>
                <input
                  type="text"
                  value={settings.gistId}
                  onChange={(e) => updateSettings({ gistId: e.target.value })}
                  placeholder="Auto-generated on first publish"
                  className={`${inputCls} mt-1.5 font-mono-meta text-xs`}
                />
              </div>
              <div>
                <label className={labelCls}>Gist Filename</label>
                <input
                  type="text"
                  value={settings.gistFilename}
                  onChange={(e) =>
                    updateSettings({ gistFilename: e.target.value })
                  }
                  placeholder="rahas-site-content.json"
                  className={`${inputCls} mt-1.5 font-mono-meta text-xs`}
                />
              </div>
            </div>

            <div>
              <label className={labelCls}>
                GitHub Personal Access Token (gist scope · private to your browser)
              </label>
              <div className="relative mt-1.5">
                <input
                  type={showSecret ? 'text' : 'password'}
                  value={settings.githubToken}
                  onChange={(e) =>
                    updateSettings({ githubToken: e.target.value })
                  }
                  placeholder="ghp_... or github_pat_..."
                  className={`${inputCls} pr-10 font-mono-meta text-xs`}
                />
                <button
                  type="button"
                  onClick={() => setShowSecret((s) => !s)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)] cursor-pointer"
                  aria-label="Toggle token visibility"
                >
                  {showSecret ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <p className="mt-1.5 text-[11px] text-[var(--text-muted)]">
                Create a free token at GitHub → Settings → Developer settings →
                Personal access tokens (check only <strong>gist</strong>). Never
                shared publicly.
              </p>
            </div>
          </>
        )}

        {activeProvider === 'github-repo' && (
          <>
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
              <div>
                <label className={labelCls}>GitHub Owner</label>
                <input
                  type="text"
                  value={settings.githubOwner}
                  onChange={(e) =>
                    updateSettings({ githubOwner: e.target.value })
                  }
                  placeholder="rahassharma"
                  className={`${inputCls} mt-1.5 font-mono-meta text-xs`}
                />
              </div>
              <div>
                <label className={labelCls}>Repository Name</label>
                <input
                  type="text"
                  value={settings.githubRepo}
                  onChange={(e) =>
                    updateSettings({ githubRepo: e.target.value })
                  }
                  placeholder="my-website"
                  className={`${inputCls} mt-1.5 font-mono-meta text-xs`}
                />
              </div>
              <div>
                <label className={labelCls}>Branch</label>
                <input
                  type="text"
                  value={settings.githubBranch}
                  onChange={(e) =>
                    updateSettings({ githubBranch: e.target.value })
                  }
                  placeholder="main"
                  className={`${inputCls} mt-1.5 font-mono-meta text-xs`}
                />
              </div>
            </div>

            <div>
              <label className={labelCls}>Target JSON File Path</label>
              <input
                type="text"
                value={settings.githubFilePath}
                onChange={(e) =>
                  updateSettings({ githubFilePath: e.target.value })
                }
                placeholder="public/site-content.json"
                className={`${inputCls} mt-1.5 font-mono-meta text-xs`}
              />
            </div>

            <div>
              <label className={labelCls}>
                GitHub Personal Access Token (contents: write · private to your browser)
              </label>
              <div className="relative mt-1.5">
                <input
                  type={showSecret ? 'text' : 'password'}
                  value={settings.githubToken}
                  onChange={(e) =>
                    updateSettings({ githubToken: e.target.value })
                  }
                  placeholder="ghp_... or github_pat_..."
                  className={`${inputCls} pr-10 font-mono-meta text-xs`}
                />
                <button
                  type="button"
                  onClick={() => setShowSecret((s) => !s)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)] cursor-pointer"
                  aria-label="Toggle token visibility"
                >
                  {showSecret ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <p className="mt-1.5 text-[11px] text-[var(--text-muted)]">
                Committing <code>public/site-content.json</code> directly to
                your site&apos;s GitHub repo updates Vercel, Netlify, or GitHub
                Pages worldwide automatically.
              </p>
            </div>
          </>
        )}

        {activeProvider === 'firebase' && (
          <>
            <div>
              <label className={labelCls}>
                Firebase Realtime Database URL
              </label>
              <input
                type="url"
                value={settings.firebaseUrl}
                onChange={(e) =>
                  updateSettings({ firebaseUrl: e.target.value })
                }
                placeholder="https://your-project-default-rtdb.firebaseio.com/site.json"
                className={`${inputCls} mt-1.5 font-mono-meta text-xs`}
              />
            </div>
            <div>
              <label className={labelCls}>
                Database Secret / Auth Token (optional · private to your browser)
              </label>
              <div className="relative mt-1.5">
                <input
                  type={showSecret ? 'text' : 'password'}
                  value={settings.firebaseAuthSecret}
                  onChange={(e) =>
                    updateSettings({ firebaseAuthSecret: e.target.value })
                  }
                  placeholder="Optional Firebase auth secret"
                  className={`${inputCls} pr-10 font-mono-meta text-xs`}
                />
                <button
                  type="button"
                  onClick={() => setShowSecret((s) => !s)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)] cursor-pointer"
                  aria-label="Toggle secret visibility"
                >
                  {showSecret ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <p className="mt-1.5 text-[11px] leading-relaxed text-[var(--text-muted)]">
                Recommended Firebase RTDB Rules so everyone worldwide can read
                while only your secret can write:{' '}
                <code className="rounded bg-[var(--bg)] px-1.5 py-0.5 font-mono-meta text-[10px]">
                  {`{ "rules": { ".read": true, ".write": false } }`}
                </code>
              </p>
            </div>
          </>
        )}

        {/* Primary Publish & Diagnostics Actions */}
        <div className="flex flex-wrap items-center gap-2.5 pt-2">
          <button
            type="button"
            disabled={publishing}
            onClick={handlePublish}
            className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[var(--accent-hover)] disabled:opacity-50 cursor-pointer"
          >
            <CloudUpload className="h-4 w-4" />
            <span>
              {publishing
                ? 'Publishing worldwide...'
                : activeProvider === 'github-gist' && !settings.gistId.trim()
                  ? 'Create Gist & Publish Worldwide'
                  : 'Publish Worldwide Now'}
            </span>
          </button>

          <button
            type="button"
            disabled={testingRead}
            onClick={handleTestPublicRead}
            className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-strong)] bg-[var(--surface)] px-4 py-2.5 text-xs font-medium text-[var(--text)] hover:border-[var(--accent)] disabled:opacity-50 cursor-pointer"
          >
            <Globe className="h-3.5 w-3.5 text-[var(--accent)]" />
            <span>
              {testingRead ? 'Testing...' : 'Test Worldwide Public Read'}
            </span>
          </button>

          {activeProvider === 'github-repo' && (
            <button
              type="button"
              disabled={publishing}
              onClick={handleCommitConfigToRepo}
              className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-strong)] bg-[var(--surface)] px-4 py-2.5 text-xs font-medium text-[var(--text)] hover:border-[var(--accent)] disabled:opacity-50 cursor-pointer"
            >
              <Cloud className="h-3.5 w-3.5 text-[var(--accent)]" />
              <span>Also Commit cloudConfig.ts</span>
            </button>
          )}
        </div>

        {readTestResult && (
          <div
            className={`rounded-xl border px-4 py-3 text-xs leading-relaxed ${
              readTestResult.ok && readTestResult.bakedIntoBuild
                ? 'border-[var(--accent)]/40 bg-[var(--accent-soft)] text-[var(--text)]'
                : readTestResult.ok
                  ? 'border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-800/60 dark:bg-amber-950/30 dark:text-amber-200'
                  : 'border-red-200 bg-red-50 text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300'
            }`}
          >
            <p className="font-semibold">
              {readTestResult.ok
                ? readTestResult.bakedIntoBuild
                  ? '✓ Worldwide Read Verified'
                  : '⚠ Cloud Read Works — One Step Left for Other Devices'
                : '✕ Public Read Failed'}
              {readTestResult.httpStatus ? ` (HTTP ${readTestResult.httpStatus})` : ''}
            </p>
            <p className="mt-1">{readTestResult.message}</p>
            {readTestResult.updatedAt && (
              <p className="mt-1 font-mono-meta text-[10px] opacity-80">
                Cloud snapshot timestamp:{' '}
                {new Date(readTestResult.updatedAt).toLocaleString()}
              </p>
            )}
          </div>
        )}

        {statusMessage && (
          <div
            className={`rounded-xl border px-4 py-3 text-xs leading-relaxed ${
              statusMessage.type === 'success'
                ? 'border-[var(--accent)]/35 bg-[var(--accent-soft)] text-[var(--text)]'
                : 'border-red-200 bg-red-50 text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300'
            }`}
          >
            <p>{statusMessage.text}</p>
            {statusMessage.link && (
              <a
                href={statusMessage.link}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1.5 inline-flex items-center gap-1 font-medium text-[var(--accent)] hover:underline"
              >
                <span>Open on GitHub</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        )}
      </div>

      {/* One-Time Global Read Wiring */}
      <div className="space-y-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/50 p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-[var(--accent)]" />
            <p className={labelCls}>
              One-Time Setup So Every Visitor Worldwide Reads Your Cloud File
            </p>
          </div>
          <span className="rounded-full border border-[var(--border)] px-2.5 py-0.5 font-mono-meta text-[10px] text-[var(--text-secondary)]">
            {isPublicConfigBakedIn ? 'Connected in build ✓' : 'Zero secrets included'}
          </span>
        </div>

        <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
          If you deploy this site publicly (GitHub Pages / Vercel / Netlify):
          either place your downloaded <code>site-content.json</code> inside{' '}
          <code>public/site-content.json</code> (auto-loaded by default),{' '}
          <strong>or</strong> paste this public config into{' '}
          <code>src/config/cloudConfig.ts</code> once so every visitor worldwide
          instantly loads your live Gist / Repo / Firebase edits.
        </p>

        <pre className="max-h-44 overflow-auto rounded-xl border border-[var(--border)] bg-[var(--bg)] p-3 font-mono-meta text-[11px] leading-relaxed text-[var(--text-secondary)]">
          <code>{configSnippet}</code>
        </pre>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleCopyConfigSnippet}
            className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-strong)] bg-[var(--surface)] px-4 py-2 text-xs font-medium text-[var(--text)] hover:border-[var(--accent)] cursor-pointer"
          >
            {copiedConfig ? (
              <>
                <Check className="h-3.5 w-3.5 text-[var(--accent)]" />
                <span className="text-[var(--accent)]">Copied cloudConfig.ts</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy cloudConfig.ts</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDownloadStaticFile}
            className="inline-flex items-center gap-1.5 rounded-full bg-[var(--text)] px-4 py-2 text-xs font-medium text-[var(--bg)] hover:opacity-90 cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download site-content.json</span>
          </button>
        </div>
      </div>
    </div>
  );
};
