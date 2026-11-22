import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  X,
  User,
  Type,
  Lightbulb,
  BookOpen,
  Cpu,
  Award,
  Palette,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Download,
  Upload,
  RotateCcw,
  LogOut,
  Check,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Globe,
} from 'lucide-react';
import {
  ACCENT_OPTIONS,
  DEFAULT_PROFILE,
  DEFAULT_PROJECTS,
  HonorItem,
  Project,
  Publication,
  SiteProfile,
  SocialLink,
  SocialPlatform,
} from '../data/siteData';
import { getSessionInfo } from '../utils/adminAuth';
import { normalizeHex } from '../utils/colorUtils';
import { ImageControl } from './ImageControl';
import { SOCIAL_PLATFORM_OPTIONS, SocialIcon } from './SocialIcons';
import { PublishTab } from './PublishTab';

export interface SectionVisibility {
  mission: boolean;
  publications: boolean;
  projects: boolean;
  honors: boolean;
}

export const DEFAULT_VISIBILITY: SectionVisibility = {
  mission: true,
  publications: true,
  projects: true,
  honors: true,
};

export type AdminTabId =
  | 'publish'
  | 'profile'
  | 'hero'
  | 'images'
  | 'mission'
  | 'publications'
  | 'projects'
  | 'honors'
  | 'appearance';

interface AdminPanelProps {
  open: boolean;
  initialTab?: AdminTabId;
  hasUnpublishedChanges: boolean;
  profile: SiteProfile;
  publications: Publication[];
  projects: Project[];
  honors: HonorItem[];
  theme: 'light' | 'dark';
  visibility: SectionVisibility;
  onUpdateProfile: (next: SiteProfile) => void;
  onUpdatePublications: (next: Publication[]) => void;
  onUpdateProjects: (next: Project[]) => void;
  onUpdateHonors: (next: HonorItem[]) => void;
  onSetTheme: (t: 'light' | 'dark') => void;
  onUpdateVisibility: (next: SectionVisibility) => void;
  onPublished: (timestamp: string) => void;
  onPullLive: () => Promise<boolean>;
  onResetAll: () => void;
  onLogout: () => void;
  onClose: () => void;
}

const TABS: { id: AdminTabId; label: string; icon: React.ElementType }[] = [
  { id: 'publish', label: 'Publish Live', icon: Globe },
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'hero', label: 'Hero', icon: Type },
  { id: 'images', label: 'Images', icon: ImageIcon },
  { id: 'mission', label: 'Mission', icon: Lightbulb },
  { id: 'publications', label: 'Publications', icon: BookOpen },
  { id: 'projects', label: 'Projects', icon: Cpu },
  { id: 'honors', label: 'Honors', icon: Award },
  { id: 'appearance', label: 'Site & Data', icon: Palette },
];

const IMAGE_PRESETS = [
  '/images/hero-lab.jpg',
  '/images/project-astra.jpg',
  '/images/project-kavach.jpg',
  '/images/project-soilsense.jpg',
];

const inputCls =
  'w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none';
const labelCls =
  'block font-mono-meta text-[10px] uppercase tracking-[0.14em] text-[var(--text-muted)]';

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      <div className="mt-1.5">{children}</div>
      {hint && (
        <p className="mt-1 text-[11px] leading-relaxed text-[var(--text-muted)]">
          {hint}
        </p>
      )}
    </div>
  );
}

function moveItem<T>(arr: T[], from: number, to: number): T[] {
  if (to < 0 || to >= arr.length) return arr;
  const next = [...arr];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  open,
  initialTab,
  hasUnpublishedChanges,
  profile,
  publications,
  projects,
  honors,
  theme,
  visibility,
  onUpdateProfile,
  onUpdatePublications,
  onUpdateProjects,
  onUpdateHonors,
  onSetTheme,
  onUpdateVisibility,
  onPublished,
  onPullLive,
  onResetAll,
  onLogout,
  onClose,
}) => {
  const [tab, setTab] = useState<AdminTabId>(initialTab || 'profile');

  useEffect(() => {
    if (open && initialTab) {
      setTab(initialTab);
    }
  }, [open, initialTab]);
  const [selectedPubId, setSelectedPubId] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedHonorId, setSelectedHonorId] = useState<string | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);
  const [hexDraft, setHexDraft] = useState<string>(
    profile.customAccentHex || '#265C4B'
  );
  const [presetNameDraft, setPresetNameDraft] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const session = getSessionInfo();

  const selectedPub = useMemo(
    () =>
      publications.find((p) => p.id === selectedPubId) ??
      publications[0] ??
      null,
    [publications, selectedPubId]
  );
  const selectedProject = useMemo(
    () =>
      projects.find((p) => p.id === selectedProjectId) ??
      projects[0] ??
      null,
    [projects, selectedProjectId]
  );
  const selectedHonor = useMemo(
    () => honors.find((h) => h.id === selectedHonorId) ?? honors[0] ?? null,
    [honors, selectedHonorId]
  );

  if (!open) return null;

  const flashSaved = () => {
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1600);
  };

  const updateProfileField = <K extends keyof SiteProfile>(
    key: K,
    value: SiteProfile[K]
  ) => {
    onUpdateProfile({ ...profile, [key]: value });
    flashSaved();
  };

  // ---------- Publications helpers ----------
  const patchPub = (id: string, patch: Partial<Publication>) => {
    onUpdatePublications(
      publications.map((p) => (p.id === id ? { ...p, ...patch } : p))
    );
  };

  const addPublication = () => {
    const id = `pub-${Date.now()}`;
    const next: Publication = {
      id,
      indexLabel: `[${publications.length + 1}]`,
      title: 'New Research Title',
      venue: 'Conference / Venue Name',
      location: '',
      year: String(new Date().getFullYear()),
      status: 'Accepted',
      statusType: 'paper',
      role: 'Sole Author',
      abstract: 'Brief summary of the accepted work.',
      note: '',
      bibtex: `@inproceedings{sharma${new Date().getFullYear()}new,\n  author = {Sharma, Rahas},\n  title = {New Research Title},\n  year = {${new Date().getFullYear()}}\n}`,
      tags: ['New'],
    };
    onUpdatePublications([...publications, next]);
    setSelectedPubId(id);
  };

  const deletePublication = (id: string) => {
    if (!window.confirm('Delete this publication?')) return;
    onUpdatePublications(publications.filter((p) => p.id !== id));
    if (selectedPubId === id) setSelectedPubId(null);
  };

  // ---------- Projects helpers ----------
  const patchProject = (id: string, patch: Partial<Project>) => {
    onUpdateProjects(projects.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  };

  const addProject = () => {
    const id = `project-${Date.now()}`;
    const next: Project = {
      id,
      code: `PROJECT ${String(projects.length + 1).padStart(2, '0')}`,
      title: 'New System',
      subtitle: 'Short descriptor',
      domain: 'Precision Agriculture',
      category: 'Precision Agriculture',
      year: String(new Date().getFullYear()),
      statusBadge: 'Active Prototype',
      image: IMAGE_PRESETS[1],
      summary: 'Technical summary of the new system.',
      problem: 'Field problem this system addresses.',
      specs: [{ label: 'Architecture Overview', content: 'Describe hardware + software.' }],
      outcomes: [{ label: 'Status', value: 'Active' }],
      stack: ['ESP32', 'Sensor Fusion'],
      repoUrl: profile.githubUrl,
    };
    onUpdateProjects([next, ...projects]);
    setSelectedProjectId(id);
  };

  const deleteProject = (id: string) => {
    if (!window.confirm('Delete this project?')) return;
    onUpdateProjects(projects.filter((p) => p.id !== id));
    if (selectedProjectId === id) setSelectedProjectId(null);
  };

  // ---------- Honors helpers ----------
  const patchHonor = (id: string, patch: Partial<HonorItem>) => {
    onUpdateHonors(honors.map((h) => (h.id === id ? { ...h, ...patch } : h)));
  };

  const addHonor = () => {
    const id = `honor-${Date.now()}`;
    const next: HonorItem = {
      id,
      year: String(new Date().getFullYear()),
      title: 'New Honor / Recognition',
      shortTag: 'Category',
      distinction: 'Participant',
      credentialMeta: '',
      details: 'Details of the recognition.',
    };
    onUpdateHonors([...honors, next]);
    setSelectedHonorId(id);
  };

  const deleteHonor = (id: string) => {
    if (!window.confirm('Delete this honor?')) return;
    onUpdateHonors(honors.filter((h) => h.id !== id));
    if (selectedHonorId === id) setSelectedHonorId(null);
  };

  // ---------- Export / Import ----------
  const handleExport = () => {
    const data = { profile, publications, projects, honors, theme, visibility };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rahas-site-backup.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (parsed.profile) onUpdateProfile({ ...profile, ...parsed.profile });
        if (Array.isArray(parsed.publications))
          onUpdatePublications(parsed.publications);
        if (Array.isArray(parsed.projects)) onUpdateProjects(parsed.projects);
        if (Array.isArray(parsed.honors)) onUpdateHonors(parsed.honors);
        if (parsed.theme === 'light' || parsed.theme === 'dark')
          onSetTheme(parsed.theme);
        if (parsed.visibility) onUpdateVisibility({ ...visibility, ...parsed.visibility });
        flashSaved();
        alert('Backup imported successfully.');
      } catch {
        alert('Could not import file. Please check the JSON format.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div
      className="fixed inset-0 z-[65] flex items-center justify-center bg-black/60 p-2 backdrop-blur-sm sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Admin panel"
    >
      <div className="flex h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg)] shadow-2xl">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--accent-soft)] font-serif-display text-base text-[var(--accent)]">
              {profile.monogram || 'RS'}
            </span>
            <div>
              <h2 className="font-serif-display text-xl leading-tight text-[var(--text)] sm:text-2xl">
                Admin Studio
              </h2>
              <p className="font-mono-meta text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)]">
                {session ? `Signed in as ${session.user}` : 'Signed in'} · edits save live
                {savedFlash && <span className="ml-2 text-[var(--accent)]">· Saved ✓</span>}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="#top"
              onClick={onClose}
              className="hidden items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3.5 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text)] sm:inline-flex"
            >
              <Eye className="h-3.5 w-3.5" />
              <span>View site</span>
            </a>
            <button
              type="button"
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3.5 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-red-600 cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Log out</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--text)] text-[var(--bg)] hover:opacity-90 cursor-pointer"
              aria-label="Close admin panel"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col md:flex-row">
          {/* Sidebar tabs */}
          <div className="flex shrink-0 gap-1.5 overflow-x-auto border-b border-[var(--border)] bg-[var(--surface)]/60 p-3 md:w-52 md:flex-col md:overflow-visible md:border-b-0 md:border-r">
            {TABS.map(({ id, label, icon: Icon }) => {
              const active = tab === id;
              const count =
                id === 'publications'
                  ? publications.length
                  : id === 'projects'
                    ? projects.length
                    : id === 'honors'
                      ? honors.length
                      : id === 'images'
                        ? 1 + projects.length
                        : null;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTab(id)}
                  className={`flex shrink-0 items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-left text-[13px] font-medium transition-all cursor-pointer ${
                    active
                      ? 'bg-[var(--text)] text-[var(--bg)]'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--surface)] hover:text-[var(--text)]'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{label}</span>
                  {id === 'publish' && hasUnpublishedChanges && (
                    <span
                      className="ml-auto h-2 w-2 rounded-full bg-amber-500"
                      title="Unpublished local edits"
                    />
                  )}
                  {count !== null && (
                    <span
                      className={`ml-auto rounded-full px-2 py-0.5 font-mono-meta text-[10px] ${
                        active
                          ? 'bg-white/20 text-white'
                          : 'bg-[var(--surface-subtle)] text-[var(--text-muted)]'
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-7 sm:py-6">
            {tab === 'publish' && (
              <PublishTab
                snapshot={{
                  version: 1,
                  updatedAt: new Date().toISOString(),
                  profile,
                  publications,
                  projects,
                  honors,
                  theme,
                  visibility,
                }}
                hasUnpublishedChanges={hasUnpublishedChanges}
                onPublished={onPublished}
                onPullLive={onPullLive}
              />
            )}

            {tab === 'profile' && (
              <div className="space-y-5">
                <div>
                  <h3 className="font-serif-display text-2xl text-[var(--text)]">Identity & Contact</h3>
                  <p className="mt-1 text-xs text-[var(--text-muted)]">Hero header, navbar, contact and footer pull from these fields.</p>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Full Name">
                    <input value={profile.name} onChange={(e) => updateProfileField('name', e.target.value)} className={inputCls} />
                  </Field>
                  <Field label="Monogram (navbar badge)">
                    <input value={profile.monogram} maxLength={3} onChange={(e) => updateProfileField('monogram', e.target.value)} className={inputCls} />
                  </Field>
                </div>
                <Field label="Tagline (under name)">
                  <input value={profile.tagline} onChange={(e) => updateProfileField('tagline', e.target.value)} className={inputCls} />
                </Field>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Current Status Pill">
                    <input value={profile.currentStatus} onChange={(e) => updateProfileField('currentStatus', e.target.value)} className={inputCls} />
                  </Field>
                  <Field label="Institution">
                    <input value={profile.institution} onChange={(e) => updateProfileField('institution', e.target.value)} className={inputCls} />
                  </Field>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <Field label="Location">
                    <input value={profile.location} onChange={(e) => updateProfileField('location', e.target.value)} className={inputCls} />
                  </Field>
                  <Field label="Coordinates">
                    <input value={profile.coordinates} onChange={(e) => updateProfileField('coordinates', e.target.value)} className={inputCls} />
                  </Field>
                  <Field label="Timezone (IANA)">
                    <input value={profile.timezone} onChange={(e) => updateProfileField('timezone', e.target.value)} className={inputCls} placeholder="Asia/Kolkata" />
                  </Field>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Email">
                    <input type="email" value={profile.email} onChange={(e) => updateProfileField('email', e.target.value)} className={inputCls} />
                  </Field>
                  <Field label="GitHub URL">
                    <input value={profile.githubUrl} onChange={(e) => updateProfileField('githubUrl', e.target.value)} className={inputCls} />
                  </Field>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="GitHub Handle Label">
                    <input value={profile.githubHandle} onChange={(e) => updateProfileField('githubHandle', e.target.value)} className={inputCls} />
                  </Field>
                  <Field label="GitHub Note">
                    <textarea rows={3} value={profile.githubNote} onChange={(e) => updateProfileField('githubNote', e.target.value)} className={`${inputCls} resize-none`} />
                  </Field>
                </div>

                {/* Social & Academic Profiles Manager */}
                <div className="border-t border-[var(--border)] pt-6">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h4 className="font-serif-display text-xl text-[var(--text)]">
                        Social & Academic Profiles
                      </h4>
                      <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                        Connect LinkedIn, Google Scholar, ORCID, X, IEEE Xplore, or any link. Links with a URL appear automatically in Hero & Contact.
                      </p>
                    </div>
                  </div>

                  {/* Quick-Add Platform Buttons */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {SOCIAL_PLATFORM_OPTIONS.map((opt) => (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => {
                          const nextItem: SocialLink = {
                            id: `social-${opt.key}-${Date.now()}`,
                            platform: opt.key,
                            label: opt.label,
                            url: '',
                            enabled: true,
                          };
                          onUpdateProfile({
                            ...profile,
                            socialLinks: [...(profile.socialLinks || []), nextItem],
                          });
                          flashSaved();
                        }}
                        className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-[11px] font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)] cursor-pointer"
                      >
                        <Plus className="h-3 w-3" />
                        <SocialIcon platform={opt.key} className="h-3 w-3" />
                        <span>{opt.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Connected / Configured Links */}
                  <div className="mt-4 space-y-3">
                    {(profile.socialLinks || []).length === 0 ? (
                      <p className="rounded-xl border border-dashed border-[var(--border-strong)] p-4 text-center text-xs text-[var(--text-muted)]">
                        No social accounts added yet — click LinkedIn or any platform above to connect one.
                      </p>
                    ) : (
                      (profile.socialLinks || []).map((social, idx) => {
                        const platformMeta = SOCIAL_PLATFORM_OPTIONS.find(
                          (p) => p.key === social.platform
                        );
                        const updateSocial = (patch: Partial<SocialLink>) => {
                          const next = (profile.socialLinks || []).map((item) =>
                            item.id === social.id ? { ...item, ...patch } : item
                          );
                          onUpdateProfile({ ...profile, socialLinks: next });
                          flashSaved();
                        };
                        return (
                          <div
                            key={social.id}
                            className={`rounded-xl border p-3.5 transition-colors ${
                              social.enabled
                                ? 'border-[var(--border)] bg-[var(--surface)]'
                                : 'border-dashed border-[var(--border-strong)] bg-[var(--surface)]/40 opacity-75'
                            }`}
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent)]">
                                  <SocialIcon platform={social.platform} className="h-3.5 w-3.5" />
                                </span>
                                <span className="font-mono-meta text-[11px] font-medium text-[var(--text)]">
                                  {social.label || platformMeta?.label || 'Link'}
                                </span>
                                {social.url.trim() ? (
                                  <span className="rounded-full bg-[var(--accent-soft)] px-2 py-0.5 font-mono-meta text-[9px] uppercase tracking-wider text-[var(--accent)]">
                                    Connected
                                  </span>
                                ) : (
                                  <span className="rounded-full border border-[var(--border)] px-2 py-0.5 font-mono-meta text-[9px] uppercase tracking-wider text-[var(--text-muted)]">
                                    Paste URL to activate
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => updateSocial({ enabled: !social.enabled })}
                                  className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] px-2.5 py-1 font-mono-meta text-[10px] text-[var(--text-secondary)] hover:text-[var(--text)] cursor-pointer"
                                  title={social.enabled ? 'Hide link' : 'Show link'}
                                >
                                  {social.enabled ? (
                                    <>
                                      <Eye className="h-3 w-3 text-[var(--accent)]" /> Shown
                                    </>
                                  ) : (
                                    <>
                                      <EyeOff className="h-3 w-3" /> Hidden
                                    </>
                                  )}
                                </button>
                                <button
                                  type="button"
                                  disabled={idx === 0}
                                  onClick={() => {
                                    onUpdateProfile({
                                      ...profile,
                                      socialLinks: moveItem(
                                        profile.socialLinks || [],
                                        idx,
                                        idx - 1
                                      ),
                                    });
                                    flashSaved();
                                  }}
                                  className="flex h-6 w-6 items-center justify-center rounded-full border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] disabled:opacity-30 cursor-pointer"
                                  aria-label="Move up"
                                >
                                  <ArrowUp className="h-3 w-3" />
                                </button>
                                <button
                                  type="button"
                                  disabled={idx === (profile.socialLinks || []).length - 1}
                                  onClick={() => {
                                    onUpdateProfile({
                                      ...profile,
                                      socialLinks: moveItem(
                                        profile.socialLinks || [],
                                        idx,
                                        idx + 1
                                      ),
                                    });
                                    flashSaved();
                                  }}
                                  className="flex h-6 w-6 items-center justify-center rounded-full border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] disabled:opacity-30 cursor-pointer"
                                  aria-label="Move down"
                                >
                                  <ArrowDown className="h-3 w-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    onUpdateProfile({
                                      ...profile,
                                      socialLinks: (profile.socialLinks || []).filter(
                                        (s) => s.id !== social.id
                                      ),
                                    });
                                    flashSaved();
                                  }}
                                  className="flex h-6 w-6 items-center justify-center rounded-full border border-[var(--border)] text-[var(--text-muted)] hover:border-red-300 hover:text-red-600 cursor-pointer"
                                  aria-label="Delete social link"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            </div>

                            <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-12">
                              <div className="sm:col-span-3">
                                <select
                                  value={social.platform}
                                  onChange={(e) => {
                                    const nextPlat = e.target.value as SocialPlatform;
                                    const meta = SOCIAL_PLATFORM_OPTIONS.find(
                                      (p) => p.key === nextPlat
                                    );
                                    updateSocial({
                                      platform: nextPlat,
                                      label: meta?.label || social.label,
                                    });
                                  }}
                                  className={`${inputCls} text-xs`}
                                >
                                  {SOCIAL_PLATFORM_OPTIONS.map((opt) => (
                                    <option key={opt.key} value={opt.key}>
                                      {opt.label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div className="sm:col-span-3">
                                <input
                                  type="text"
                                  value={social.label}
                                  onChange={(e) => updateSocial({ label: e.target.value })}
                                  placeholder="Display label"
                                  className={`${inputCls} text-xs`}
                                />
                              </div>
                              <div className="sm:col-span-6">
                                <input
                                  type="url"
                                  value={social.url}
                                  onChange={(e) => updateSocial({ url: e.target.value })}
                                  placeholder={
                                    platformMeta?.placeholder || 'https://...'
                                  }
                                  className={`${inputCls} text-xs`}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            )}

            {tab === 'hero' && (
              <div className="space-y-5">
                <div>
                  <h3 className="font-serif-display text-2xl text-[var(--text)]">Hero Headline & Summary</h3>
                  <p className="mt-1 text-xs text-[var(--text-muted)]">Controls the big serif statement on the landing section.</p>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <Field label="Headline — Start">
                    <input value={profile.headlineStart} onChange={(e) => updateProfileField('headlineStart', e.target.value)} className={inputCls} />
                  </Field>
                  <Field label="Headline — Italic Accent">
                    <input value={profile.headlineAccent} onChange={(e) => updateProfileField('headlineAccent', e.target.value)} className={`${inputCls} italic`} />
                  </Field>
                  <Field label="Headline — End">
                    <input value={profile.headlineEnd} onChange={(e) => updateProfileField('headlineEnd', e.target.value)} className={inputCls} />
                  </Field>
                </div>
                <Field label="Credentials Summary (under headline)" hint="e.g. acceptance counts, focus areas.">
                  <textarea rows={3} value={profile.heroSummary} onChange={(e) => updateProfileField('heroSummary', e.target.value)} className={`${inputCls} resize-none`} />
                </Field>
                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
                  <p className={labelCls}>Live Preview</p>
                  <p className="mt-2 font-serif-display text-3xl leading-tight text-[var(--text)]">
                    {profile.headlineStart}{' '}
                    <span className="italic text-[var(--accent)]">{profile.headlineAccent}</span>{' '}
                    {profile.headlineEnd}
                  </p>
                  <p className="mt-2 text-sm text-[var(--text-secondary)]">{profile.heroSummary}</p>
                </div>

                <ImageControl
                  title="Hero Featured Photo"
                  aspectClass="aspect-[4/5]"
                  defaultSrc={DEFAULT_PROFILE.heroImage}
                  showCaption
                  value={{
                    src: profile.heroImage || DEFAULT_PROFILE.heroImage,
                    alt: profile.heroImageAlt || DEFAULT_PROFILE.heroImageAlt,
                    caption:
                      profile.heroImageCaption || DEFAULT_PROFILE.heroImageCaption,
                    position: profile.heroImagePosition || '50% 50%',
                    fit: profile.heroImageFit || 'cover',
                    zoom: profile.heroImageZoom || 1,
                  }}
                  onChange={(patch) => {
                    const next: SiteProfile = { ...profile };
                    if (patch.src !== undefined) next.heroImage = patch.src;
                    if (patch.alt !== undefined) next.heroImageAlt = patch.alt;
                    if (patch.caption !== undefined)
                      next.heroImageCaption = patch.caption;
                    if (patch.position !== undefined)
                      next.heroImagePosition = patch.position;
                    if (patch.fit !== undefined) next.heroImageFit = patch.fit;
                    if (patch.zoom !== undefined) next.heroImageZoom = patch.zoom;
                    onUpdateProfile(next);
                    flashSaved();
                  }}
                />
              </div>
            )}

            {tab === 'images' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-serif-display text-2xl text-[var(--text)]">
                    Media & Images Studio
                  </h3>
                  <p className="mt-1 text-xs text-[var(--text-muted)]">
                    Upload from your device, drag & drop, paste any URL, adjust focal
                    crop (X/Y), zoom, fit mode, captions, and alt text for every image
                    across your website.
                  </p>
                </div>

                <ImageControl
                  title="Hero Photo — Landing Section"
                  aspectClass="aspect-[4/5]"
                  defaultSrc={DEFAULT_PROFILE.heroImage}
                  showCaption
                  value={{
                    src: profile.heroImage || DEFAULT_PROFILE.heroImage,
                    alt: profile.heroImageAlt || DEFAULT_PROFILE.heroImageAlt,
                    caption:
                      profile.heroImageCaption || DEFAULT_PROFILE.heroImageCaption,
                    position: profile.heroImagePosition || '50% 50%',
                    fit: profile.heroImageFit || 'cover',
                    zoom: profile.heroImageZoom || 1,
                  }}
                  onChange={(patch) => {
                    const next: SiteProfile = { ...profile };
                    if (patch.src !== undefined) next.heroImage = patch.src;
                    if (patch.alt !== undefined) next.heroImageAlt = patch.alt;
                    if (patch.caption !== undefined)
                      next.heroImageCaption = patch.caption;
                    if (patch.position !== undefined)
                      next.heroImagePosition = patch.position;
                    if (patch.fit !== undefined) next.heroImageFit = patch.fit;
                    if (patch.zoom !== undefined) next.heroImageZoom = patch.zoom;
                    onUpdateProfile(next);
                    flashSaved();
                  }}
                />

                {projects.map((proj) => {
                  const defaultProj = DEFAULT_PROJECTS.find(
                    (dp) => dp.id === proj.id
                  );
                  return (
                    <ImageControl
                      key={proj.id}
                      title={`${proj.code} — ${proj.title}`}
                      aspectClass="aspect-[16/11]"
                      defaultSrc={defaultProj?.image || IMAGE_PRESETS[1]}
                      value={{
                        src: proj.image,
                        alt:
                          proj.imageAlt || `${proj.title} — ${proj.subtitle}`,
                        position: proj.imagePosition || '50% 50%',
                        fit: proj.imageFit || 'cover',
                        zoom: proj.imageZoom || 1,
                      }}
                      onChange={(patch) => {
                        patchProject(proj.id, {
                          ...(patch.src !== undefined ? { image: patch.src } : {}),
                          ...(patch.alt !== undefined
                            ? { imageAlt: patch.alt }
                            : {}),
                          ...(patch.position !== undefined
                            ? { imagePosition: patch.position }
                            : {}),
                          ...(patch.fit !== undefined
                            ? { imageFit: patch.fit }
                            : {}),
                          ...(patch.zoom !== undefined
                            ? { imageZoom: patch.zoom }
                            : {}),
                        });
                        flashSaved();
                      }}
                    />
                  );
                })}
              </div>
            )}

            {tab === 'mission' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-serif-display text-2xl text-[var(--text)]">Mission & Philosophy</h3>
                  <p className="mt-1 text-xs text-[var(--text-muted)]">Mission statement, pillars and communities served.</p>
                </div>
                <Field label="Mission Statement (verbatim)">
                  <textarea rows={6} value={profile.missionStatement} onChange={(e) => updateProfileField('missionStatement', e.target.value)} className={`${inputCls} resize-none leading-relaxed`} />
                </Field>

                <div>
                  <div className="flex items-center justify-between">
                    <p className={labelCls}>Philosophy Pillars ({profile.philosophyPillars.length})</p>
                    <button
                      type="button"
                      onClick={() => {
                        onUpdateProfile({
                          ...profile,
                          philosophyPillars: [
                            ...profile.philosophyPillars,
                            { title: 'New Pillar', description: 'Describe the principle.' },
                          ],
                        });
                        flashSaved();
                      }}
                      className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] px-2.5 py-1 text-[11px] font-medium text-[var(--text)] hover:border-[var(--accent)] cursor-pointer"
                    >
                      <Plus className="h-3 w-3" /> Add
                    </button>
                  </div>
                  <div className="mt-3 space-y-3">
                    {profile.philosophyPillars.map((pillar, i) => (
                      <div key={i} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
                        <div className="flex items-center justify-between">
                          <span className="font-mono-meta text-[11px] text-[var(--accent)]">PILLAR {i + 1}</span>
                          <button
                            type="button"
                            onClick={() => {
                              onUpdateProfile({
                                ...profile,
                                philosophyPillars: profile.philosophyPillars.filter((_, x) => x !== i),
                              });
                            }}
                            className="text-[var(--text-muted)] hover:text-red-600 cursor-pointer"
                            aria-label="Delete pillar"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <div className="mt-2 grid grid-cols-1 gap-2.5">
                          <input
                            value={pillar.title}
                            onChange={(e) => {
                              const next = [...profile.philosophyPillars];
                              next[i] = { ...next[i], title: e.target.value };
                              onUpdateProfile({ ...profile, philosophyPillars: next });
                            }}
                            className={inputCls}
                            placeholder="Pillar title"
                          />
                          <textarea
                            rows={2}
                            value={pillar.description}
                            onChange={(e) => {
                              const next = [...profile.philosophyPillars];
                              next[i] = { ...next[i], description: e.target.value };
                              onUpdateProfile({ ...profile, philosophyPillars: next });
                            }}
                            className={`${inputCls} resize-none`}
                            placeholder="Pillar description"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <p className={labelCls}>Communities Served ({profile.demographicsServed.length})</p>
                    <button
                      type="button"
                      onClick={() => {
                        onUpdateProfile({
                          ...profile,
                          demographicsServed: [
                            ...profile.demographicsServed,
                            { label: 'New Community', detail: 'Who they are and constraints.' },
                          ],
                        });
                        flashSaved();
                      }}
                      className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] px-2.5 py-1 text-[11px] font-medium text-[var(--text)] hover:border-[var(--accent)] cursor-pointer"
                    >
                      <Plus className="h-3 w-3" /> Add
                    </button>
                  </div>
                  <div className="mt-3 space-y-3">
                    {profile.demographicsServed.map((d, i) => (
                      <div key={i} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
                        <div className="flex items-center justify-between">
                          <span className="font-mono-meta text-[11px] text-[var(--accent)]">GROUP {i + 1}</span>
                          <button
                            type="button"
                            onClick={() => {
                              onUpdateProfile({
                                ...profile,
                                demographicsServed: profile.demographicsServed.filter((_, x) => x !== i),
                              });
                            }}
                            className="text-[var(--text-muted)] hover:text-red-600 cursor-pointer"
                            aria-label="Delete group"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <div className="mt-2 grid grid-cols-1 gap-2.5">
                          <input value={d.label} onChange={(e) => {
                            const next = [...profile.demographicsServed];
                            next[i] = { ...next[i], label: e.target.value };
                            onUpdateProfile({ ...profile, demographicsServed: next });
                          }} className={inputCls} placeholder="Label" />
                          <textarea rows={2} value={d.detail} onChange={(e) => {
                            const next = [...profile.demographicsServed];
                            next[i] = { ...next[i], detail: e.target.value };
                            onUpdateProfile({ ...profile, demographicsServed: next });
                          }} className={`${inputCls} resize-none`} placeholder="Detail" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {tab === 'publications' && (
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
                <div className="lg:col-span-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif-display text-xl text-[var(--text)]">All Publications</h3>
                    <button type="button" onClick={addPublication} className="inline-flex items-center gap-1 rounded-full bg-[var(--text)] px-3 py-1.5 text-[11px] font-medium text-[var(--bg)] hover:opacity-90 cursor-pointer">
                      <Plus className="h-3 w-3" /> New
                    </button>
                  </div>
                  <div className="mt-3 space-y-2">
                    {publications.map((p, idx) => {
                      const active = selectedPub?.id === p.id;
                      return (
                        <div key={p.id} className={`rounded-xl border p-3 transition-colors ${active ? 'border-[var(--accent)] bg-[var(--surface)]' : 'border-[var(--border)] bg-[var(--surface)]/50'}`}>
                          <button type="button" onClick={() => setSelectedPubId(p.id)} className="w-full text-left cursor-pointer">
                            <p className="font-mono-meta text-[10px] text-[var(--accent)]">{p.indexLabel} · {p.year} · {p.statusType}</p>
                            <p className="mt-1 line-clamp-2 text-[13px] font-medium leading-snug text-[var(--text)]">{p.title}</p>
                          </button>
                          <div className="mt-2 flex items-center gap-1.5">
                            <button type="button" disabled={idx === 0} onClick={() => onUpdatePublications(moveItem(publications, idx, idx - 1))} className="flex h-6 w-6 items-center justify-center rounded-full border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] disabled:opacity-30 cursor-pointer" aria-label="Move up"><ArrowUp className="h-3 w-3" /></button>
                            <button type="button" disabled={idx === publications.length - 1} onClick={() => onUpdatePublications(moveItem(publications, idx, idx + 1))} className="flex h-6 w-6 items-center justify-center rounded-full border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] disabled:opacity-30 cursor-pointer" aria-label="Move down"><ArrowDown className="h-3 w-3" /></button>
                            <button type="button" onClick={() => deletePublication(p.id)} className="ml-auto flex h-6 w-6 items-center justify-center rounded-full border border-[var(--border)] text-[var(--text-muted)] hover:border-red-300 hover:text-red-600 cursor-pointer" aria-label="Delete"><Trash2 className="h-3 w-3" /></button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="lg:col-span-8">
                  {selectedPub ? (
                    <div className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/50 p-4 sm:p-5">
                      <h3 className="font-serif-display text-xl text-[var(--text)]">Edit Publication</h3>
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Index Label"><input value={selectedPub.indexLabel} onChange={(e) => patchPub(selectedPub.id, { indexLabel: e.target.value })} className={inputCls} /></Field>
                        <Field label="Year"><input value={selectedPub.year} onChange={(e) => patchPub(selectedPub.id, { year: e.target.value })} className={inputCls} /></Field>
                      </div>
                      <Field label="Paper Title"><textarea rows={2} value={selectedPub.title} onChange={(e) => patchPub(selectedPub.id, { title: e.target.value })} className={`${inputCls} resize-none`} /></Field>
                      <Field label="Venue"><input value={selectedPub.venue} onChange={(e) => patchPub(selectedPub.id, { venue: e.target.value })} className={inputCls} /></Field>
                      <Field label="Location (optional — leave blank to hide)"><input value={selectedPub.location ?? ''} onChange={(e) => patchPub(selectedPub.id, { location: e.target.value })} className={inputCls} placeholder="e.g. Chennai, India" /></Field>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <Field label="Status Badge"><input value={selectedPub.status} onChange={(e) => patchPub(selectedPub.id, { status: e.target.value })} className={inputCls} /></Field>
                        <Field label="Type">
                          <select value={selectedPub.statusType} onChange={(e) => patchPub(selectedPub.id, { statusType: e.target.value as Publication['statusType'] })} className={inputCls}>
                            <option value="paper">paper</option>
                            <option value="poster">poster</option>
                            <option value="late-breaking">late-breaking</option>
                          </select>
                        </Field>
                        <Field label="Role"><input value={selectedPub.role} onChange={(e) => patchPub(selectedPub.id, { role: e.target.value })} className={inputCls} /></Field>
                      </div>
                      <Field label="Abstract / Summary"><textarea rows={3} value={selectedPub.abstract} onChange={(e) => patchPub(selectedPub.id, { abstract: e.target.value })} className={`${inputCls} resize-none`} /></Field>
                      <Field label="Note (optional)"><textarea rows={2} value={selectedPub.note ?? ''} onChange={(e) => patchPub(selectedPub.id, { note: e.target.value })} className={`${inputCls} resize-none`} /></Field>
                      <Field label="Tags (comma-separated)"><input value={selectedPub.tags.join(', ')} onChange={(e) => patchPub(selectedPub.id, { tags: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })} className={inputCls} /></Field>
                      <Field label="BibTeX"><textarea rows={6} value={selectedPub.bibtex} onChange={(e) => patchPub(selectedPub.id, { bibtex: e.target.value })} className={`${inputCls} resize-none font-mono-meta !text-xs`} /></Field>
                    </div>
                  ) : (
                    <p className="text-sm text-[var(--text-muted)]">No publications yet. Click New to add one.</p>
                  )}
                </div>
              </div>
            )}

            {tab === 'projects' && (
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
                <div className="lg:col-span-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif-display text-xl text-[var(--text)]">All Projects</h3>
                    <button type="button" onClick={addProject} className="inline-flex items-center gap-1 rounded-full bg-[var(--text)] px-3 py-1.5 text-[11px] font-medium text-[var(--bg)] hover:opacity-90 cursor-pointer">
                      <Plus className="h-3 w-3" /> New
                    </button>
                  </div>
                  <div className="mt-3 space-y-2">
                    {projects.map((p, idx) => {
                      const active = selectedProject?.id === p.id;
                      return (
                        <div key={p.id} className={`rounded-xl border p-3 ${active ? 'border-[var(--accent)] bg-[var(--surface)]' : 'border-[var(--border)] bg-[var(--surface)]/50'}`}>
                          <button type="button" onClick={() => setSelectedProjectId(p.id)} className="flex w-full items-center gap-2.5 text-left cursor-pointer">
                            <span className="h-9 w-14 shrink-0 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface-subtle)]">
                              <img src={p.image} alt="" className="h-full w-full object-cover" />
                            </span>
                            <span>
                              <span className="block font-mono-meta text-[10px] text-[var(--accent)]">{p.code} · {p.category}</span>
                              <span className="block text-[13px] font-semibold text-[var(--text)]">{p.title}</span>
                            </span>
                          </button>
                          <div className="mt-2 flex items-center gap-1.5">
                            <button type="button" disabled={idx === 0} onClick={() => onUpdateProjects(moveItem(projects, idx, idx - 1))} className="flex h-6 w-6 items-center justify-center rounded-full border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] disabled:opacity-30 cursor-pointer" aria-label="Move up"><ArrowUp className="h-3 w-3" /></button>
                            <button type="button" disabled={idx === projects.length - 1} onClick={() => onUpdateProjects(moveItem(projects, idx, idx + 1))} className="flex h-6 w-6 items-center justify-center rounded-full border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] disabled:opacity-30 cursor-pointer" aria-label="Move down"><ArrowDown className="h-3 w-3" /></button>
                            <button type="button" onClick={() => deleteProject(p.id)} className="ml-auto flex h-6 w-6 items-center justify-center rounded-full border border-[var(--border)] text-[var(--text-muted)] hover:border-red-300 hover:text-red-600 cursor-pointer" aria-label="Delete"><Trash2 className="h-3 w-3" /></button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="lg:col-span-8">
                  {selectedProject ? (
                    <div className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/50 p-4 sm:p-5">
                      <h3 className="font-serif-display text-xl text-[var(--text)]">Edit Project</h3>
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Code"><input value={selectedProject.code} onChange={(e) => patchProject(selectedProject.id, { code: e.target.value })} className={inputCls} /></Field>
                        <Field label="Year"><input value={selectedProject.year} onChange={(e) => patchProject(selectedProject.id, { year: e.target.value })} className={inputCls} /></Field>
                      </div>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <Field label="Title"><input value={selectedProject.title} onChange={(e) => patchProject(selectedProject.id, { title: e.target.value })} className={inputCls} /></Field>
                        <Field label="Subtitle"><input value={selectedProject.subtitle} onChange={(e) => patchProject(selectedProject.id, { subtitle: e.target.value })} className={inputCls} /></Field>
                      </div>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <Field label="Domain"><input value={selectedProject.domain} onChange={(e) => patchProject(selectedProject.id, { domain: e.target.value })} className={inputCls} /></Field>
                        <Field label="Filter Category">
                          <select value={selectedProject.category} onChange={(e) => patchProject(selectedProject.id, { category: e.target.value as Project['category'] })} className={inputCls}>
                            <option value="Precision Agriculture">Precision Agriculture</option>
                            <option value="Humanitarian Wearables">Humanitarian Wearables</option>
                          </select>
                        </Field>
                      </div>
                      <Field label="Status Badge"><input value={selectedProject.statusBadge} onChange={(e) => patchProject(selectedProject.id, { statusBadge: e.target.value })} className={inputCls} /></Field>
                      <ImageControl
                        title="Project Cover Image"
                        aspectClass="aspect-[16/11]"
                        defaultSrc={
                          DEFAULT_PROJECTS.find(
                            (dp) => dp.id === selectedProject.id
                          )?.image || IMAGE_PRESETS[1]
                        }
                        value={{
                          src: selectedProject.image,
                          alt:
                            selectedProject.imageAlt ||
                            `${selectedProject.title} — ${selectedProject.subtitle}`,
                          position: selectedProject.imagePosition || '50% 50%',
                          fit: selectedProject.imageFit || 'cover',
                          zoom: selectedProject.imageZoom || 1,
                        }}
                        onChange={(patch) => {
                          patchProject(selectedProject.id, {
                            ...(patch.src !== undefined
                              ? { image: patch.src }
                              : {}),
                            ...(patch.alt !== undefined
                              ? { imageAlt: patch.alt }
                              : {}),
                            ...(patch.position !== undefined
                              ? { imagePosition: patch.position }
                              : {}),
                            ...(patch.fit !== undefined
                              ? { imageFit: patch.fit }
                              : {}),
                            ...(patch.zoom !== undefined
                              ? { imageZoom: patch.zoom }
                              : {}),
                          });
                          flashSaved();
                        }}
                      />
                      <Field label="Card Summary"><textarea rows={3} value={selectedProject.summary} onChange={(e) => patchProject(selectedProject.id, { summary: e.target.value })} className={`${inputCls} resize-none`} /></Field>
                      <Field label="The Problem"><textarea rows={3} value={selectedProject.problem} onChange={(e) => patchProject(selectedProject.id, { problem: e.target.value })} className={`${inputCls} resize-none`} /></Field>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <Field label="Repo URL"><input value={selectedProject.repoUrl ?? ''} onChange={(e) => patchProject(selectedProject.id, { repoUrl: e.target.value })} className={inputCls} /></Field>
                        <Field label="Stack (comma-separated)"><input value={selectedProject.stack.join(', ')} onChange={(e) => patchProject(selectedProject.id, { stack: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })} className={inputCls} /></Field>
                      </div>

                      <div>
                        <div className="flex items-center justify-between">
                          <p className={labelCls}>Spec Blocks ({selectedProject.specs.length})</p>
                          <button type="button" onClick={() => patchProject(selectedProject.id, { specs: [...selectedProject.specs, { label: 'New Section', content: 'Details...' }] })} className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] px-2.5 py-1 text-[11px] font-medium cursor-pointer hover:border-[var(--accent)]"><Plus className="h-3 w-3" /> Add</button>
                        </div>
                        <div className="mt-2.5 space-y-2.5">
                          {selectedProject.specs.map((s, i) => (
                            <div key={i} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3">
                              <div className="flex items-center justify-between">
                                <span className="font-mono-meta text-[10px] text-[var(--accent)]">SPEC {i + 1}</span>
                                <button type="button" onClick={() => patchProject(selectedProject.id, { specs: selectedProject.specs.filter((_, x) => x !== i) })} className="text-[var(--text-muted)] hover:text-red-600 cursor-pointer"><Trash2 className="h-3.5 w-3.5" /></button>
                              </div>
                              <input value={s.label} onChange={(e) => {
                                const next = [...selectedProject.specs];
                                next[i] = { ...next[i], label: e.target.value };
                                patchProject(selectedProject.id, { specs: next });
                              }} className={`${inputCls} mt-2`} placeholder="Section label" />
                              <textarea rows={2} value={s.content} onChange={(e) => {
                                const next = [...selectedProject.specs];
                                next[i] = { ...next[i], content: e.target.value };
                                patchProject(selectedProject.id, { specs: next });
                              }} className={`${inputCls} mt-2 resize-none`} placeholder="Section content" />
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between">
                          <p className={labelCls}>Outcome Metrics ({selectedProject.outcomes.length})</p>
                          <button type="button" onClick={() => patchProject(selectedProject.id, { outcomes: [...selectedProject.outcomes, { label: 'Metric', value: '—' }] })} className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] px-2.5 py-1 text-[11px] font-medium cursor-pointer hover:border-[var(--accent)]"><Plus className="h-3 w-3" /> Add</button>
                        </div>
                        <div className="mt-2.5 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                          {selectedProject.outcomes.map((o, i) => (
                            <div key={i} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3">
                              <div className="flex items-center justify-between">
                                <span className="font-mono-meta text-[10px] text-[var(--accent)]">0{i + 1}</span>
                                <button type="button" onClick={() => patchProject(selectedProject.id, { outcomes: selectedProject.outcomes.filter((_, x) => x !== i) })} className="text-[var(--text-muted)] hover:text-red-600 cursor-pointer"><Trash2 className="h-3 w-3" /></button>
                              </div>
                              <input value={o.value} onChange={(e) => {
                                const next = [...selectedProject.outcomes];
                                next[i] = { ...next[i], value: e.target.value };
                                patchProject(selectedProject.id, { outcomes: next });
                              }} className={`${inputCls} mt-2`} placeholder="Value" />
                              <input value={o.label} onChange={(e) => {
                                const next = [...selectedProject.outcomes];
                                next[i] = { ...next[i], label: e.target.value };
                                patchProject(selectedProject.id, { outcomes: next });
                              }} className={`${inputCls} mt-1.5`} placeholder="Label" />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-[var(--text-muted)]">No projects yet. Click New to add one.</p>
                  )}
                </div>
              </div>
            )}

            {tab === 'honors' && (
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
                <div className="lg:col-span-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif-display text-xl text-[var(--text)]">All Honors</h3>
                    <button type="button" onClick={addHonor} className="inline-flex items-center gap-1 rounded-full bg-[var(--text)] px-3 py-1.5 text-[11px] font-medium text-[var(--bg)] hover:opacity-90 cursor-pointer">
                      <Plus className="h-3 w-3" /> New
                    </button>
                  </div>
                  <div className="mt-3 space-y-2">
                    {honors.map((h, idx) => {
                      const active = selectedHonor?.id === h.id;
                      return (
                        <div key={h.id} className={`rounded-xl border p-3 ${active ? 'border-[var(--accent)] bg-[var(--surface)]' : 'border-[var(--border)] bg-[var(--surface)]/50'}`}>
                          <button type="button" onClick={() => setSelectedHonorId(h.id)} className="w-full text-left cursor-pointer">
                            <p className="font-mono-meta text-[10px] text-[var(--accent)]">{h.year} · {h.distinction}</p>
                            <p className="mt-1 line-clamp-2 text-[13px] font-medium text-[var(--text)]">{h.title}</p>
                          </button>
                          <div className="mt-2 flex items-center gap-1.5">
                            <button type="button" disabled={idx === 0} onClick={() => onUpdateHonors(moveItem(honors, idx, idx - 1))} className="flex h-6 w-6 items-center justify-center rounded-full border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] disabled:opacity-30 cursor-pointer" aria-label="Move up"><ArrowUp className="h-3 w-3" /></button>
                            <button type="button" disabled={idx === honors.length - 1} onClick={() => onUpdateHonors(moveItem(honors, idx, idx + 1))} className="flex h-6 w-6 items-center justify-center rounded-full border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] disabled:opacity-30 cursor-pointer" aria-label="Move down"><ArrowDown className="h-3 w-3" /></button>
                            <button type="button" onClick={() => deleteHonor(h.id)} className="ml-auto flex h-6 w-6 items-center justify-center rounded-full border border-[var(--border)] text-[var(--text-muted)] hover:border-red-300 hover:text-red-600 cursor-pointer" aria-label="Delete"><Trash2 className="h-3 w-3" /></button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="lg:col-span-8">
                  {selectedHonor ? (
                    <div className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/50 p-4 sm:p-5">
                      <h3 className="font-serif-display text-xl text-[var(--text)]">Edit Honor</h3>
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Year"><input value={selectedHonor.year} onChange={(e) => patchHonor(selectedHonor.id, { year: e.target.value })} className={inputCls} /></Field>
                        <Field label="Distinction Badge"><input value={selectedHonor.distinction} onChange={(e) => patchHonor(selectedHonor.id, { distinction: e.target.value })} className={inputCls} placeholder="e.g. Applicant, Winner" /></Field>
                      </div>
                      <Field label="Title"><input value={selectedHonor.title} onChange={(e) => patchHonor(selectedHonor.id, { title: e.target.value })} className={inputCls} /></Field>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <Field label="Short Tag"><input value={selectedHonor.shortTag} onChange={(e) => patchHonor(selectedHonor.id, { shortTag: e.target.value })} className={inputCls} /></Field>
                        <Field label="Credential Meta (optional)"><input value={selectedHonor.credentialMeta ?? ''} onChange={(e) => patchHonor(selectedHonor.id, { credentialMeta: e.target.value })} className={inputCls} placeholder="e.g. Application ID: 5056981" /></Field>
                      </div>
                      <Field label="Details"><textarea rows={4} value={selectedHonor.details} onChange={(e) => patchHonor(selectedHonor.id, { details: e.target.value })} className={`${inputCls} resize-none`} /></Field>
                    </div>
                  ) : (
                    <p className="text-sm text-[var(--text-muted)]">No honors yet. Click New to add one.</p>
                  )}
                </div>
              </div>
            )}

            {tab === 'appearance' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-serif-display text-2xl text-[var(--text)]">Appearance, Sections & Data</h3>
                  <p className="mt-1 text-xs text-[var(--text-muted)]">Theme, accent, section visibility, backups and danger zone.</p>
                </div>

                <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
                  {/* Accent Presets + Custom Hex Builder */}
                  <div className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/50 p-4 lg:col-span-8">
                    <div className="flex items-center justify-between">
                      <p className={labelCls}>Signature Accent & Custom Presets</p>
                      <span className="font-mono-meta text-[10px] text-[var(--accent)]">
                        {profile.accent === 'custom'
                          ? profile.customAccentHex
                          : ACCENT_OPTIONS.find((o) => o.key === profile.accent)?.swatch}
                      </span>
                    </div>

                    {/* Built-in Presets */}
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {ACCENT_OPTIONS.map((opt) => {
                        const selected = profile.accent === opt.key;
                        return (
                          <button
                            key={opt.key}
                            type="button"
                            onClick={() => {
                              setHexDraft(opt.swatch);
                              onUpdateProfile({
                                ...profile,
                                accent: opt.key,
                                customAccentHex: opt.swatch,
                              });
                              flashSaved();
                            }}
                            className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium cursor-pointer ${selected ? 'border-[var(--text)] bg-[var(--surface)] text-[var(--text)]' : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]'}`}
                          >
                            <span
                              className="h-3.5 w-3.5 shrink-0 rounded-full border border-black/10"
                              style={{ backgroundColor: opt.swatch }}
                            />
                            <span className="truncate">{opt.label}</span>
                            {selected && (
                              <Check className="ml-auto h-3.5 w-3.5 shrink-0 text-[var(--accent)]" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Saved Custom Hex Presets */}
                    {(profile.savedColorPresets || []).length > 0 && (
                      <div>
                        <p className="font-mono-meta text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)]">
                          Your Saved Presets ({profile.savedColorPresets.length})
                        </p>
                        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                          {profile.savedColorPresets.map((preset) => {
                            const selected =
                              profile.accent === 'custom' &&
                              normalizeHex(profile.customAccentHex) ===
                                normalizeHex(preset.hex);
                            return (
                              <div
                                key={preset.id}
                                className={`flex items-center gap-2 rounded-xl border px-3 py-2 transition-colors ${selected ? 'border-[var(--text)] bg-[var(--surface)] text-[var(--text)]' : 'border-[var(--border)] bg-[var(--bg)]/60 text-[var(--text-secondary)] hover:border-[var(--border-strong)]'}`}
                              >
                                <button
                                  type="button"
                                  onClick={() => {
                                    setHexDraft(preset.hex);
                                    onUpdateProfile({
                                      ...profile,
                                      accent: 'custom',
                                      customAccentHex: preset.hex,
                                    });
                                    flashSaved();
                                  }}
                                  className="flex min-w-0 flex-1 items-center gap-2.5 text-left cursor-pointer"
                                >
                                  <span
                                    className="h-4 w-4 shrink-0 rounded-full border border-black/15"
                                    style={{ backgroundColor: preset.hex }}
                                  />
                                  <span className="truncate text-xs font-medium text-[var(--text)]">
                                    {preset.label}
                                  </span>
                                  <span className="ml-auto font-mono-meta text-[10px] text-[var(--text-muted)]">
                                    {preset.hex}
                                  </span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    onUpdateProfile({
                                      ...profile,
                                      savedColorPresets:
                                        profile.savedColorPresets.filter(
                                          (p) => p.id !== preset.id
                                        ),
                                    });
                                    flashSaved();
                                  }}
                                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[var(--text-muted)] hover:bg-red-50 hover:text-red-600 cursor-pointer dark:hover:bg-red-950/30"
                                  aria-label={`Delete preset ${preset.label}`}
                                  title="Remove preset"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Pick Any Color + Save as Preset */}
                    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-3.5">
                      <p className="font-mono-meta text-[10px] uppercase tracking-[0.14em] text-[var(--text-muted)]">
                        Pick Any Color & Save as Preset
                      </p>
                      <div className="mt-2.5 flex flex-wrap items-center gap-2.5">
                        {/* Native Color Wheel */}
                        <label
                          className="relative flex h-10 w-12 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-[var(--border-strong)]"
                          title="Open color picker"
                        >
                          <input
                            type="color"
                            value={
                              normalizeHex(hexDraft) ||
                              normalizeHex(profile.customAccentHex) ||
                              '#265C4B'
                            }
                            onChange={(e) => {
                              const nextHex = e.target.value.toUpperCase();
                              setHexDraft(nextHex);
                              onUpdateProfile({
                                ...profile,
                                accent: 'custom',
                                customAccentHex: nextHex,
                              });
                              flashSaved();
                            }}
                            className="h-14 w-16 cursor-pointer border-0 bg-transparent p-0"
                          />
                        </label>

                        {/* Hex Input */}
                        <input
                          type="text"
                          value={hexDraft}
                          onChange={(e) => {
                            const raw = e.target.value;
                            setHexDraft(raw);
                            const valid = normalizeHex(raw);
                            if (valid) {
                              onUpdateProfile({
                                ...profile,
                                accent: 'custom',
                                customAccentHex: valid,
                              });
                              flashSaved();
                            }
                          }}
                          placeholder="#1D4ED8"
                          maxLength={7}
                          className="w-28 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 font-mono-meta text-xs uppercase text-[var(--text)] focus:border-[var(--accent)] focus:outline-none"
                        />

                        {/* Preset Name Input */}
                        <input
                          type="text"
                          value={presetNameDraft}
                          onChange={(e) => setPresetNameDraft(e.target.value)}
                          placeholder="Preset name (e.g. Kashmir Pine)"
                          className="min-w-[160px] flex-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--text)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none"
                        />

                        {/* Save Preset Button */}
                        <button
                          type="button"
                          disabled={!normalizeHex(hexDraft)}
                          onClick={() => {
                            const valid = normalizeHex(hexDraft);
                            if (!valid) return;
                            const label =
                              presetNameDraft.trim() || `Custom ${valid}`;
                            const newPreset = {
                              id: `preset-${Date.now()}`,
                              label,
                              hex: valid,
                            };
                            onUpdateProfile({
                              ...profile,
                              accent: 'custom',
                              customAccentHex: valid,
                              savedColorPresets: [
                                ...(profile.savedColorPresets || []),
                                newPreset,
                              ],
                            });
                            setPresetNameDraft('');
                            flashSaved();
                          }}
                          className="inline-flex items-center gap-1.5 rounded-full bg-[var(--text)] px-4 py-2 text-xs font-medium text-[var(--bg)] transition-opacity hover:opacity-90 disabled:opacity-40 cursor-pointer"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          <span>Save Preset</span>
                        </button>
                      </div>
                      {hexDraft && !normalizeHex(hexDraft) && (
                        <p className="mt-1.5 text-[11px] text-red-600 dark:text-red-400">
                          Enter a valid 3 or 6-character hex code (e.g. #265C4B or #0F766E).
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Color Theme */}
                  <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/50 p-4 lg:col-span-4">
                    <p className={labelCls}>Color Theme</p>
                    <div className="mt-2.5 grid grid-cols-2 gap-2">
                      {(['light', 'dark'] as const).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => onSetTheme(t)}
                          className={`rounded-xl border px-3 py-2.5 text-xs font-medium capitalize cursor-pointer ${theme === t ? 'border-[var(--text)] bg-[var(--surface)] text-[var(--text)]' : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]'}`}
                        >
                          {t} {theme === t && '✓'}
                        </button>
                      ))}
                    </div>
                    <p className="mt-2.5 text-[11px] leading-relaxed text-[var(--text-muted)]">
                      Custom hex accents automatically generate balanced hover and
                      soft tint shades for both light and dark modes.
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/50 p-4">
                  <p className={labelCls}>Section Visibility</p>
                  <p className="mt-1 text-[11px] text-[var(--text-muted)]">Hide any section without deleting its content.</p>
                  <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {(
                      [
                        ['mission', 'Mission & Bio'],
                        ['publications', 'Publications'],
                        ['projects', 'Projects'],
                        ['honors', 'Honors'],
                      ] as [keyof SectionVisibility, string][]
                    ).map(([key, label]) => {
                      const on = visibility[key];
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => onUpdateVisibility({ ...visibility, [key]: !on })}
                          className={`flex items-center justify-between rounded-xl border px-3.5 py-2.5 text-[13px] font-medium cursor-pointer ${on ? 'border-[var(--border)] bg-[var(--surface)] text-[var(--text)]' : 'border-dashed border-[var(--border-strong)] text-[var(--text-muted)]'}`}
                        >
                          <span>{label}</span>
                          <span className="inline-flex items-center gap-1.5 font-mono-meta text-[11px]">
                            {on ? (
                              <>
                                <Eye className="h-3.5 w-3.5 text-[var(--accent)]" /> Visible
                              </>
                            ) : (
                              <>
                                <EyeOff className="h-3.5 w-3.5" /> Hidden
                              </>
                            )}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/50 p-4">
                  <p className={labelCls}>Backup & Restore</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button type="button" onClick={handleExport} className="inline-flex items-center gap-1.5 rounded-full bg-[var(--text)] px-4 py-2 text-xs font-medium text-[var(--bg)] hover:opacity-90 cursor-pointer">
                      <Download className="h-3.5 w-3.5" /> Export JSON backup
                    </button>
                    <button type="button" onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-strong)] px-4 py-2 text-xs font-medium text-[var(--text)] hover:border-[var(--text)] cursor-pointer">
                      <Upload className="h-3.5 w-3.5" /> Import backup
                    </button>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="application/json"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleImportFile(f);
                        e.target.value = '';
                      }}
                    />
                  </div>
                  <p className="mt-2 text-[11px] text-[var(--text-muted)]">Keep a copy before big edits. Import restores profile, publications, projects, honors, theme and visibility.</p>
                </div>

                <div className="rounded-2xl border border-red-200 bg-red-50/50 p-4 dark:border-red-900/30 dark:bg-red-950/10">
                  <p className="font-mono-meta text-[10px] uppercase tracking-[0.14em] text-red-600 dark:text-red-400">Danger zone</p>
                  <div className="mt-2.5 flex flex-wrap items-center gap-2">
                    <button type="button" onClick={() => { if (window.confirm('Reset EVERYTHING to defaults? This clears all your edits.')) onResetAll(); }} className="inline-flex items-center gap-1.5 rounded-full border border-red-300 bg-white px-4 py-2 text-xs font-medium text-red-700 hover:bg-red-100 cursor-pointer dark:bg-transparent dark:text-red-300">
                      <RotateCcw className="h-3.5 w-3.5" /> Reset all to defaults
                    </button>
                    <button type="button" onClick={onLogout} className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-xs font-medium text-[var(--text-secondary)] hover:text-red-600 cursor-pointer">
                      <LogOut className="h-3.5 w-3.5" /> Log out admin
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
