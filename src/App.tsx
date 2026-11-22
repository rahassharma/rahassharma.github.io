import { useEffect, useState } from 'react';
import {
  DEFAULT_HONORS,
  DEFAULT_PROFILE,
  DEFAULT_PROJECTS,
  DEFAULT_PUBLICATIONS,
  Project,
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
import { CustomizeDrawer } from './components/CustomizeDrawer';

const STORAGE_PROFILE_KEY = 'rahas_sharma_profile_v2';
const STORAGE_PROJECTS_KEY = 'rahas_sharma_projects_v2';
const STORAGE_THEME_KEY = 'rahas_sharma_theme_v2';

function loadSavedProfile(): SiteProfile {
  try {
    const raw = localStorage.getItem(STORAGE_PROFILE_KEY);
    if (!raw) return DEFAULT_PROFILE;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_PROFILE,
      ...parsed,
      philosophyPillars:
        Array.isArray(parsed.philosophyPillars) &&
        parsed.philosophyPillars.length > 0
          ? parsed.philosophyPillars
          : DEFAULT_PROFILE.philosophyPillars,
      demographicsServed:
        Array.isArray(parsed.demographicsServed) &&
        parsed.demographicsServed.length > 0
          ? parsed.demographicsServed
          : DEFAULT_PROFILE.demographicsServed,
    };
  } catch {
    return DEFAULT_PROFILE;
  }
}

function loadSavedProjects(): Project[] {
  try {
    const raw = localStorage.getItem(STORAGE_PROJECTS_KEY);
    if (!raw) return DEFAULT_PROJECTS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_PROJECTS;
  } catch {
    return DEFAULT_PROJECTS;
  }
}

function loadSavedTheme(): 'light' | 'dark' {
  try {
    const raw = localStorage.getItem(STORAGE_THEME_KEY);
    if (raw === 'dark' || raw === 'light') return raw;
  } catch {
    // ignore
  }
  return 'light';
}

export function App() {
  const [profile, setProfile] = useState<SiteProfile>(loadSavedProfile);
  const [projects, setProjects] = useState<Project[]>(loadSavedProjects);
  const [theme, setTheme] = useState<'light' | 'dark'>(loadSavedTheme);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [customizeOpen, setCustomizeOpen] = useState(false);

  // Sync theme & accent attributes on root element
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    root.setAttribute('data-accent', profile.accent);
    try {
      localStorage.setItem(STORAGE_THEME_KEY, theme);
    } catch {
      // ignore storage quota issues
    }
  }, [theme, profile.accent]);

  // Persist profile and update document title
  useEffect(() => {
    document.title = `${profile.name} — ${profile.tagline}`;
    try {
      localStorage.setItem(STORAGE_PROFILE_KEY, JSON.stringify(profile));
    } catch {
      // ignore
    }
  }, [profile]);

  // Persist projects
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_PROJECTS_KEY, JSON.stringify(projects));
    } catch {
      // ignore
    }
  }, [projects]);

  const handleAddProject = (project: Project) => {
    setProjects((prev) => [project, ...prev]);
  };

  const handleResetAll = () => {
    setProfile(DEFAULT_PROFILE);
    setProjects(DEFAULT_PROJECTS);
    try {
      localStorage.removeItem(STORAGE_PROFILE_KEY);
      localStorage.removeItem(STORAGE_PROJECTS_KEY);
    } catch {
      // ignore
    }
  };

  return (
    <div className="paper-grain min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <Navbar
        profile={profile}
        theme={theme}
        onToggleTheme={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
        onOpenCustomize={() => setCustomizeOpen(true)}
      />

      <main>
        <Hero profile={profile} />
        <MissionSection profile={profile} />
        <PublicationsSection publications={DEFAULT_PUBLICATIONS} />
        <WorkSection
          projects={projects}
          onSelectProject={(project) => setSelectedProject(project)}
        />
        <HonorsSection honors={DEFAULT_HONORS} />
        <ContactSection
          profile={profile}
          onOpenCustomize={() => setCustomizeOpen(true)}
        />
      </main>

      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />

      <CustomizeDrawer
        open={customizeOpen}
        onClose={() => setCustomizeOpen(false)}
        profile={profile}
        onUpdateProfile={setProfile}
        onAddProject={handleAddProject}
        onResetAll={handleResetAll}
      />
    </div>
  );
}

export default App;
