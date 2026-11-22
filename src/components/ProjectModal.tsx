import React, { useEffect } from 'react';
import { X, ArrowUpRight, AlertCircle } from 'lucide-react';
import { Project } from '../data/siteData';

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({ project, onClose }) => {
  useEffect(() => {
    if (!project) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKey);
    };
  }, [project, onClose]);

  if (!project) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-modal-title"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--bg)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Top Bar */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--border)] bg-[var(--bg)]/92 px-6 py-4 backdrop-blur-md">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="font-mono-meta text-[11px] uppercase tracking-[0.14em] text-[var(--accent)]">
              {project.code}
            </span>
            <span className="text-[var(--border-strong)]">/</span>
            <span className="font-mono-meta text-xs text-[var(--text-muted)]">
              {project.domain}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] transition-colors hover:border-[var(--border-strong)] hover:text-[var(--text)] cursor-pointer"
            aria-label="Close technical specification"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 font-mono-meta text-[11px] font-medium text-[var(--accent)]">
              {project.statusBadge}
            </span>
            <span className="font-mono-meta text-xs text-[var(--text-muted)]">
              {project.year}
            </span>
          </div>

          <h2
            id="project-modal-title"
            className="mt-3 font-serif-display text-4xl leading-tight text-[var(--text)] sm:text-5xl"
          >
            {project.title}
          </h2>
          <p className="mt-1.5 text-base text-[var(--text-secondary)]">
            {project.subtitle}
          </p>

          {/* Hero Image */}
          <div className="mt-6 aspect-[16/10] w-full overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)]">
            <img
              src={project.image}
              alt={project.title}
              className="h-full w-full object-cover"
            />
          </div>

          {/* Outcomes Bar */}
          {project.outcomes.length > 0 && (
            <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {project.outcomes.map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4"
                >
                  <p className="font-serif-display text-3xl text-[var(--text)]">
                    {item.value}
                  </p>
                  <p className="mt-1 font-mono-meta text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Problem Statement */}
          <div className="mt-7 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <h3 className="flex items-center gap-2 font-mono-meta text-[11px] uppercase tracking-[0.14em] text-[var(--accent)]">
              <AlertCircle className="h-3.5 w-3.5" />
              <span>The Problem</span>
            </h3>
            <p className="mt-2.5 text-sm leading-relaxed text-[var(--text-secondary)] sm:text-[15px]">
              {project.problem}
            </p>
          </div>

          {/* Detailed Technical Spec Blocks */}
          <div className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2">
            {project.specs.map((spec) => (
              <div
                key={spec.label}
                className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5"
              >
                <h3 className="font-mono-meta text-[11px] uppercase tracking-[0.14em] text-[var(--text-muted)]">
                  {spec.label}
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-[var(--text-secondary)]">
                  {spec.content}
                </p>
              </div>
            ))}
          </div>

          {/* Stack & Repo Link */}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-[var(--border)] pt-6">
            <div className="flex flex-wrap gap-2">
              {project.stack.map((tech) => (
                <span
                  key={tech}
                  className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 font-mono-meta text-[11px] text-[var(--text-secondary)]"
                >
                  {tech}
                </span>
              ))}
            </div>

            {project.repoUrl && (
              <a
                href={project.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-[var(--text)] px-5 py-2.5 text-xs font-medium text-[var(--bg)] transition-opacity hover:opacity-90"
              >
                <span>View on GitHub</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
