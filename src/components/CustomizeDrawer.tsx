import React, { useEffect, useState } from 'react';
import { X, RotateCcw, Plus, Check } from 'lucide-react';
import {
  ACCENT_OPTIONS,
  AccentKey,
  Project,
  SiteProfile,
} from '../data/siteData';

interface CustomizeDrawerProps {
  open: boolean;
  onClose: () => void;
  profile: SiteProfile;
  onUpdateProfile: (next: SiteProfile) => void;
  onAddProject: (project: Project) => void;
  onResetAll: () => void;
}

const SAMPLE_IMAGES = [
  '/images/project-astra.jpg',
  '/images/project-kavach.jpg',
  '/images/project-soilsense.jpg',
];

export const CustomizeDrawer: React.FC<CustomizeDrawerProps> = ({
  open,
  onClose,
  profile,
  onUpdateProfile,
  onAddProject,
  onResetAll,
}) => {
  const [tab, setTab] = useState<'identity' | 'projects'>('identity');
  const [newTitle, setNewTitle] = useState('');
  const [newSubtitle, setNewSubtitle] = useState('');
  const [newCategory, setNewCategory] = useState<Project['category']>(
    'Precision Agriculture'
  );
  const [newSummary, setNewSummary] = useState('');
  const [newProblem, setNewProblem] = useState('');
  const [newStack, setNewStack] = useState('ESP32, Edge ML, Sensor Fusion');
  const [addedFeedback, setAddedFeedback] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const updateField = <K extends keyof SiteProfile>(
    key: K,
    value: SiteProfile[K]
  ) => {
    onUpdateProfile({ ...profile, [key]: value });
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newSummary.trim()) return;

    const project: Project = {
      id: `project-${Date.now()}`,
      code: 'NEW PROJECT',
      title: newTitle.trim(),
      subtitle: newSubtitle.trim() || 'Independent Research System',
      domain: newCategory,
      category: newCategory,
      year: String(new Date().getFullYear()),
      statusBadge: 'Active Research Prototype',
      image: SAMPLE_IMAGES[Math.floor(Math.random() * SAMPLE_IMAGES.length)],
      summary: newSummary.trim(),
      problem:
        newProblem.trim() ||
        'Addressing systemic field reliability challenges in low-resource environments.',
      specs: [
        {
          label: 'Architecture Overview',
          content: newSummary.trim(),
        },
        {
          label: 'Engineering Principles',
          content:
            'Offline-first operation, auditable decision logic, and rugged low-cost hardware.',
        },
      ],
      outcomes: [
        { label: 'Status', value: 'Active' },
        { label: 'Year', value: String(new Date().getFullYear()) },
        { label: 'Author', value: 'Sole' },
      ],
      stack: newStack
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      repoUrl: profile.githubUrl,
    };

    onAddProject(project);
    setNewTitle('');
    setNewSubtitle('');
    setNewSummary('');
    setNewProblem('');
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 2400);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/45 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label="Edit research profile"
      onClick={onClose}
    >
      <div
        className="flex h-full w-full max-w-md flex-col border-l border-[var(--border)] bg-[var(--bg)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
          <div>
            <h2 className="font-serif-display text-2xl text-[var(--text)]">
              Edit Website
            </h2>
            <p className="font-mono-meta text-[11px] text-[var(--text-muted)]">
              Updates save locally in your browser
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--text)] cursor-pointer"
            aria-label="Close editor"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[var(--border)] px-6 pt-3">
          <button
            type="button"
            onClick={() => setTab('identity')}
            className={`border-b-2 pb-2.5 pr-5 text-xs font-medium transition-colors cursor-pointer ${
              tab === 'identity'
                ? 'border-[var(--accent)] text-[var(--text)]'
                : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text)]'
            }`}
          >
            Profile & Theme
          </button>
          <button
            type="button"
            onClick={() => setTab('projects')}
            className={`border-b-2 pb-2.5 px-5 text-xs font-medium transition-colors cursor-pointer ${
              tab === 'projects'
                ? 'border-[var(--accent)] text-[var(--text)]'
                : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text)]'
            }`}
          >
            Add Project
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {tab === 'identity' ? (
            <div className="space-y-5">
              {/* Accent Picker */}
              <div>
                <label className="block font-mono-meta text-[10px] uppercase tracking-[0.14em] text-[var(--text-muted)]">
                  Signature Accent
                </label>
                <div className="mt-2.5 grid grid-cols-2 gap-2">
                  {ACCENT_OPTIONS.map((opt) => {
                    const selected = profile.accent === opt.key;
                    return (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => updateField('accent', opt.key as AccentKey)}
                        className={`flex items-center gap-2.5 rounded-xl border px-3 py-2 text-xs font-medium transition-all cursor-pointer ${
                          selected
                            ? 'border-[var(--text)] bg-[var(--surface)] text-[var(--text)]'
                            : 'border-[var(--border)] bg-transparent text-[var(--text-secondary)] hover:border-[var(--border-strong)]'
                        }`}
                      >
                        <span
                          className="h-3.5 w-3.5 rounded-full"
                          style={{ backgroundColor: opt.swatch }}
                        />
                        <span>{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block font-mono-meta text-[10px] uppercase tracking-[0.14em] text-[var(--text-muted)]">
                    Name
                  </label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)] focus:border-[var(--accent)] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-mono-meta text-[10px] uppercase tracking-[0.14em] text-[var(--text-muted)]">
                    Initials
                  </label>
                  <input
                    type="text"
                    maxLength={3}
                    value={profile.monogram}
                    onChange={(e) => updateField('monogram', e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)] focus:border-[var(--accent)] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono-meta text-[10px] uppercase tracking-[0.14em] text-[var(--text-muted)]">
                  Tagline
                </label>
                <input
                  type="text"
                  value={profile.tagline}
                  onChange={(e) => updateField('tagline', e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)] focus:border-[var(--accent)] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-mono-meta text-[10px] uppercase tracking-[0.14em] text-[var(--text-muted)]">
                  Current Status
                </label>
                <input
                  type="text"
                  value={profile.currentStatus}
                  onChange={(e) => updateField('currentStatus', e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)] focus:border-[var(--accent)] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-mono-meta text-[10px] uppercase tracking-[0.14em] text-[var(--text-muted)]">
                  Institution
                </label>
                <input
                  type="text"
                  value={profile.institution}
                  onChange={(e) => updateField('institution', e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)] focus:border-[var(--accent)] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono-meta text-[10px] uppercase tracking-[0.14em] text-[var(--text-muted)]">
                    Location
                  </label>
                  <input
                    type="text"
                    value={profile.location}
                    onChange={(e) => updateField('location', e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)] focus:border-[var(--accent)] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-mono-meta text-[10px] uppercase tracking-[0.14em] text-[var(--text-muted)]">
                    Email
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)] focus:border-[var(--accent)] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono-meta text-[10px] uppercase tracking-[0.14em] text-[var(--text-muted)]">
                  Mission Statement
                </label>
                <textarea
                  rows={5}
                  value={profile.missionStatement}
                  onChange={(e) => updateField('missionStatement', e.target.value)}
                  className="mt-1.5 w-full resize-none rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)] focus:border-[var(--accent)] focus:outline-none"
                />
              </div>
            </div>
          ) : (
            <form onSubmit={handleCreateProject} className="space-y-4">
              <h3 className="font-mono-meta text-[10px] uppercase tracking-[0.14em] text-[var(--accent)]">
                Add Engineering Project
              </h3>
              <div>
                <label className="block text-xs text-[var(--text-muted)]">
                  Project Name
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g., VayuGuard"
                  className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)] focus:border-[var(--accent)] focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[var(--text-muted)]">
                    Domain
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) =>
                      setNewCategory(e.target.value as Project['category'])
                    }
                    className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)] focus:border-[var(--accent)] focus:outline-none"
                  >
                    <option value="Precision Agriculture">
                      Precision Agriculture
                    </option>
                    <option value="Humanitarian Wearables">
                      Humanitarian Wearables
                    </option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-[var(--text-muted)]">
                    Subtitle
                  </label>
                  <input
                    type="text"
                    value={newSubtitle}
                    onChange={(e) => setNewSubtitle(e.target.value)}
                    placeholder="Edge Sensor Node"
                    className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)] focus:border-[var(--accent)] focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-[var(--text-muted)]">
                  The Problem
                </label>
                <textarea
                  rows={2}
                  value={newProblem}
                  onChange={(e) => setNewProblem(e.target.value)}
                  placeholder="Describe the field challenge this system addresses."
                  className="mt-1 w-full resize-none rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)] focus:border-[var(--accent)] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-[var(--text-muted)]">
                  Technical Summary
                </label>
                <textarea
                  rows={3}
                  required
                  value={newSummary}
                  onChange={(e) => setNewSummary(e.target.value)}
                  placeholder="Summarize the hardware stack, algorithm, and validation."
                  className="mt-1 w-full resize-none rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)] focus:border-[var(--accent)] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-[var(--text-muted)]">
                  Hardware & Software Stack (comma-separated)
                </label>
                <input
                  type="text"
                  value={newStack}
                  onChange={(e) => setNewStack(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)] focus:border-[var(--accent)] focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-[var(--text)] px-4 py-2.5 text-xs font-medium text-[var(--bg)] transition-opacity hover:opacity-90 cursor-pointer"
              >
                {addedFeedback ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    <span>Project Added!</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add to Engineering Portfolio</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[var(--border)] px-6 py-4">
          <button
            type="button"
            onClick={onResetAll}
            className="inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)] transition-colors hover:text-[var(--text)] cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset defaults</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-[var(--accent)] px-4 py-1.5 text-xs font-medium text-white hover:bg-[var(--accent-hover)] cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
