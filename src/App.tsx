import { useCallback, useEffect, useState } from 'react';
import {
  DEFAULT_HONORS,
  DEFAULT_PROFILE,
  DEFAULT_PROJECTS,
  DEFAULT_PUBLICATIONS,
  HonorItem,
  Project,
  Publication,
  SiteProfile,
} from './data/siteData';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { MissionSection } from './components/MissionSection';
import { PublicationsSection } from './components/PublicationsSection';
import { WorkSection } from './components/WorkSection';
import { HonorsSection } from './components/HonorsSection';
import { ContactSection } from './components/ContactSection';
import { ProjectModal } from './components/ProjectModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import {
  AdminPanel,
  AdminTabId,
  DEFAULT_VISIBILITY,
  SectionVisibility,
} from './components/AdminPanel';
import { destroySession, isAuthenticated } from './utils/adminAuth';
import { computeAccentTokens, normalizeHex } from './utils/colorUtils';
import {
  DEFAULT_FONT_SETTINGS,
  applyFontSettingsToDocument,
} from './utils/fontManager';
import {
  SiteSnapshot,
  fetchWorldwideSiteData,
  getEffectivePublicConfig,
} from './utils/cloudSync';

const STORAGE_PROFILE_KEY = 'rahas_sharma_profile_v2';
const STORAGE_PROJECTS_KEY = 'rahas_sharma_projects_v2';
const STORAGE_PUBS_KEY = 'rahas_sharma_publications_v2';
const STORAGE_HONORS_KEY = 'rahas_sharma_honors_v2';
const STORAGE_THEME_KEY = 'rahas_sharma_theme_v2';
const STORAGE_VIS_KEY = 'rahas_sharma_visibility_v2';
const STORAGE_DIRTY_KEY = 'rahas_sharma_unpublished_v1';

function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (Array.isArray(fallback)) {
      return Array.isArray(parsed) && parsed.length > 0 ? (parsed as T) : fallback;
    }
    if (typeof fallback === 'object' && fallback !== null) {
      return { ...(fallback as object), ...(parsed as object) } as T;
    }
    return (parsed as T) ?? fallback;
  } catch {
    return fallback;
  }
}

function hydrateProfile(raw: Partial<SiteProfile> | undefined): SiteProfile {
  const base = raw ? { ...DEFAULT_PROFILE, ...raw } : DEFAULT_PROFILE;
  return {
    ...base,
    savedColorPresets: Array.isArray(base.savedColorPresets)
      ? base.savedColorPresets
      : DEFAULT_PROFILE.savedColorPresets,
    socialLinks: Array.isArray(base.socialLinks)
      ? base.socialLinks
      : DEFAULT_PROFILE.socialLinks,
    fonts: base.fonts
      ? {
          ...DEFAULT_FONT_SETTINGS,
          ...base.fonts,
          uploadedFonts: Array.isArray(base.fonts.uploadedFonts)
            ? base.fonts.uploadedFonts
            : [],
        }
      : DEFAULT_FONT_SETTINGS,
    philosophyPillars:
      Array.isArray(base.philosophyPillars) && base.philosophyPillars.length > 0
        ? base.philosophyPillars
        : DEFAULT_PROFILE.philosophyPillars,
    demographicsServed:
      Array.isArray(base.demographicsServed) && base.demographicsServed.length > 0
        ? base.demographicsServed
        : DEFAULT_PROFILE.demographicsServed,
  };
}

function loadSavedProfile(): SiteProfile {
  return hydrateProfile(loadJSON<SiteProfile>(STORAGE_PROFILE_KEY, DEFAULT_PROFILE));
}

export function App() {
  const [profile, setProfileState] = useState<SiteProfile>(loadSavedProfile);
  const [projects, setProjectsState] = useState<Project[]>(() =>
    loadJSON<Project[]>(STORAGE_PROJECTS_KEY, DEFAULT_PROJECTS)
  );
  const [publications, setPublicationsState] = useState<Publication[]>(() =>
    loadJSON<Publication[]>(STORAGE_PUBS_KEY, DEFAULT_PUBLICATIONS)
  );
  const [honors, setHonorsState] = useState<HonorItem[]>(() =>
    loadJSON<HonorItem[]>(STORAGE_HONORS_KEY, DEFAULT_HONORS)
  );
  const [visibility, setVisibilityState] = useState<SectionVisibility>(() =>
    loadJSON<SectionVisibility>(STORAGE_VIS_KEY, DEFAULT_VISIBILITY)
  );
  const [theme, setThemeState] = useState<'light' | 'dark'>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_THEME_KEY);
      if (raw === 'dark' || raw === 'light') return raw;
    } catch {
      // ignore
    }
    return 'light';
  });

  const [isAdmin, setIsAdmin] = useState<boolean>(() => isAuthenticated());
  const [hasUnpublishedChanges, setHasUnpublishedChanges] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_DIRTY_KEY) === '1';
    } catch {
      return false;
    }
  });
  const [loginOpen, setLoginOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelTab, setPanelTab] = useState<AdminTabId>('profile');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const markDirty = useCallback(() => {
    setHasUnpublishedChanges(true);
    try {
      localStorage.setItem(STORAGE_DIRTY_KEY, '1');
    } catch {
      // ignore
    }
  }, []);

  const clearDirty = useCallback(() => {
    setHasUnpublishedChanges(false);
    try {
      localStorage.removeItem(STORAGE_DIRTY_KEY);
    } catch {
      // ignore
    }
  }, []);

  const applyRemoteSnapshot = useCallback(
    (snap: Partial<SiteSnapshot>) => {
      if (snap.profile) setProfileState(hydrateProfile(snap.profile));
      if (Array.isArray(snap.publications) && snap.publications.length > 0) {
        setPublicationsState(snap.publications);
      }
      if (Array.isArray(snap.projects) && snap.projects.length > 0) {
        setProjectsState(snap.projects);
      }
      if (Array.isArray(snap.honors) && snap.honors.length > 0) {
        setHonorsState(snap.honors);
      }
      if (snap.visibility) {
        setVisibilityState({ ...DEFAULT_VISIBILITY, ...snap.visibility });
      }
      if (snap.theme === 'light' || snap.theme === 'dark') {
        setThemeState(snap.theme);
      }
    },
    []
  );

  // Pull latest worldwide published content on startup
  useEffect(() => {
    let active = true;
    const shouldSkipForLocalDraft = isAdmin && hasUnpublishedChanges;
    if (shouldSkipForLocalDraft) return;

    fetchWorldwideSiteData(getEffectivePublicConfig()).then((snap) => {
      if (active && snap) {
        applyRemoteSnapshot(snap);
      }
    });

    return () => {
      active = false;
    };
  }, [isAdmin, hasUnpublishedChanges, applyRemoteSnapshot]);

  const handlePullLive = useCallback(async (): Promise<boolean> => {
    const snap = await fetchWorldwideSiteData(getEffectivePublicConfig());
    if (!snap) return false;
    applyRemoteSnapshot(snap);
    clearDirty();
    return true;
  }, [applyRemoteSnapshot, clearDirty]);

  // Admin mutation wrappers (mark local edits as pending worldwide publish)
  const updateProfile = useCallback(
    (next: SiteProfile) => {
      setProfileState(next);
      markDirty();
    },
    [markDirty]
  );

  const updatePublications = useCallback(
    (next: Publication[]) => {
      setPublicationsState(next);
      markDirty();
    },
    [markDirty]
  );

  const updateProjects = useCallback(
    (next: Project[]) => {
      setProjectsState(next);
      markDirty();
    },
    [markDirty]
  );

  const updateHonors = useCallback(
    (next: HonorItem[]) => {
      setHonorsState(next);
      markDirty();
    },
    [markDirty]
  );

  const updateVisibility = useCallback(
    (next: SectionVisibility) => {
      setVisibilityState(next);
      markDirty();
    },
    [markDirty]
  );

  const setAdminTheme = useCallback(
    (next: 'light' | 'dark') => {
      setThemeState(next);
      markDirty();
    },
    [markDirty]
  );

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    root.setAttribute('data-accent', profile.accent);

    if (profile.accent === 'custom') {
      const hex = normalizeHex(profile.customAccentHex) || '#265C4B';
      const tokens = computeAccentTokens(hex, theme);
      root.style.setProperty('--accent', tokens.accent);
      root.style.setProperty('--accent-hover', tokens.hover);
      root.style.setProperty('--accent-soft', tokens.soft);
    } else {
      root.style.removeProperty('--accent');
      root.style.removeProperty('--accent-hover');
      root.style.removeProperty('--accent-soft');
    }

    try {
      localStorage.setItem(STORAGE_THEME_KEY, theme);
    } catch {
      // ignore
    }
  }, [theme, profile.accent, profile.customAccentHex]);

  useEffect(() => {
    applyFontSettingsToDocument(profile.fonts || DEFAULT_FONT_SETTINGS);
  }, [profile.fonts]);

  useEffect(() => {
    document.title = `${profile.name} — ${profile.tagline}`;
    try {
      localStorage.setItem(STORAGE_PROFILE_KEY, JSON.stringify(profile));
    } catch {
      // ignore
    }
  }, [profile]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_PROJECTS_KEY, JSON.stringify(projects));
    } catch {
      // ignore
    }
  }, [projects]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_PUBS_KEY, JSON.stringify(publications));
    } catch {
      // ignore
    }
  }, [publications]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_HONORS_KEY, JSON.stringify(honors));
    } catch {
      // ignore
    }
  }, [honors]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_VIS_KEY, JSON.stringify(visibility));
    } catch {
      // ignore
    }
  }, [visibility]);

  const handleOpenAdmin = (targetTab: AdminTabId = 'profile') => {
    setPanelTab(targetTab);
    if (isAdmin) {
      setPanelOpen(true);
    } else {
      setLoginOpen(true);
    }
  };

  const handleLoginSuccess = () => {
    setIsAdmin(true);
    setLoginOpen(false);
    setPanelOpen(true);
  };

  const handleLogout = () => {
    destroySession();
    setIsAdmin(false);
    setPanelOpen(false);
  };

  const handleResetAll = () => {
    setProfileState(DEFAULT_PROFILE);
    setProjectsState(DEFAULT_PROJECTS);
    setPublicationsState(DEFAULT_PUBLICATIONS);
    setHonorsState(DEFAULT_HONORS);
    setVisibilityState(DEFAULT_VISIBILITY);
    clearDirty();
    try {
      localStorage.removeItem(STORAGE_PROFILE_KEY);
      localStorage.removeItem(STORAGE_PROJECTS_KEY);
      localStorage.removeItem(STORAGE_PUBS_KEY);
      localStorage.removeItem(STORAGE_HONORS_KEY);
      localStorage.removeItem(STORAGE_VIS_KEY);
    } catch {
      // ignore
    }
  };

  return (
    <div className="paper-grain min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <Navbar
        profile={profile}
        theme={theme}
        isAdmin={isAdmin}
        onToggleTheme={() => setThemeState((t) => (t === 'light' ? 'dark' : 'light'))}
        onOpenAdmin={() => handleOpenAdmin('profile')}
        onLogout={handleLogout}
      />

      {isAdmin && (
        <div className="border-b border-[var(--border)] bg-[var(--accent-soft)]">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-6 py-2 sm:px-8">
            <p className="font-mono-meta text-[11px] text-[var(--accent)]">
              {hasUnpublishedChanges
                ? '● ADMIN MODE — Local draft on this device (publish to update worldwide)'
                : '● ADMIN MODE — Synced with live worldwide version'}
            </p>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => handleOpenAdmin('publish')}
                className="rounded-full bg-[var(--accent)] px-3 py-1 font-mono-meta text-[10px] font-medium text-white hover:bg-[var(--accent-hover)] cursor-pointer"
              >
                Publish Worldwide →
              </button>
              <button
                type="button"
                onClick={() => handleOpenAdmin('profile')}
                className="font-mono-meta text-[11px] font-medium text-[var(--accent)] underline-offset-2 hover:underline cursor-pointer"
              >
                Open Studio
              </button>
            </div>
          </div>
        </div>
      )}

      <main>
        <Hero profile={profile} />
        {visibility.mission && <MissionSection profile={profile} />}
        {visibility.publications && (
          <PublicationsSection publications={publications} />
        )}
        {visibility.projects && (
          <WorkSection
            projects={projects}
            onSelectProject={(project) => setSelectedProject(project)}
          />
        )}
        {visibility.honors && <HonorsSection honors={honors} />}
        <ContactSection
          profile={profile}
          onOpenCustomize={() => handleOpenAdmin('profile')}
        />
      </main>

      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />

      <AdminLoginModal
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        onSuccess={handleLoginSuccess}
      />

      <AdminPanel
        open={panelOpen && isAdmin}
        initialTab={panelTab}
        hasUnpublishedChanges={hasUnpublishedChanges}
        profile={profile}
        publications={publications}
        projects={projects}
        honors={honors}
        theme={theme}
        visibility={visibility}
        onUpdateProfile={updateProfile}
        onUpdatePublications={updatePublications}
        onUpdateProjects={updateProjects}
        onUpdateHonors={updateHonors}
        onSetTheme={setAdminTheme}
        onUpdateVisibility={updateVisibility}
        onPublished={() => clearDirty()}
        onPullLive={handlePullLive}
        onResetAll={handleResetAll}
        onLogout={handleLogout}
        onClose={() => setPanelOpen(false)}
      />
    </div>
  );
}

export default App;
