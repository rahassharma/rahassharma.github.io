import React, { useState } from 'react';
import { ArrowUpRight, Cpu } from 'lucide-react';
import { Project, ProjectCategory } from '../data/siteData';

interface WorkSectionProps {
  projects: Project[];
  onSelectProject: (project: Project) => void;
}

const CATEGORIES: ProjectCategory[] = [
  'All',
  'Precision Agriculture',
  'Humanitarian Wearables',
];

export const WorkSection: React.FC<WorkSectionProps> = ({
  projects,
  onSelectProject,
}) => {
  const [activeCategory, setActiveCategory] = useState<ProjectCategory>('All');

  const filtered =
    activeCategory === 'All'
      ? projects
      : projects.filter((p) => p.category === activeCategory);

  return (
    <section
      id="projects"
      className="mx-auto max-w-6xl border-t border-[var(--border)] px-6 py-20 sm:px-8 sm:py-28"
    >
      {/* Section Header */}
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <p className="font-mono-meta text-[11px] uppercase tracking-[0.16em] text-[var(--accent)]">
            03 / Engineering Projects
          </p>
          <h2 className="mt-3 font-serif-display text-4xl leading-[1.08] text-[var(--text)] sm:text-5xl">
            Technical portfolio & <span className="italic">hardware</span> systems
          </h2>
        </div>

        {/* Category Filter Tabs */}
        <div
          className="flex flex-wrap items-center gap-1.5"
          role="tablist"
          aria-label="Filter projects by domain"
        >
          {CATEGORIES.map((category) => {
            const isActive = activeCategory === category;
            return (
              <button
                key={category}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveCategory(category)}
                className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[var(--text)] text-[var(--bg)]'
                    : 'border border-[var(--border)] bg-transparent text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--text)]'
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>

      {/* Stacked / Feature Grid of Technical Systems */}
      <div className="mt-12 space-y-10">
        {filtered.map((project) => (
          <article
            key={project.id}
            onClick={() => onSelectProject(project)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelectProject(project);
              }
            }}
            tabIndex={0}
            role="button"
            className="group grid cursor-pointer grid-cols-1 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] transition-all hover:border-[var(--border-strong)] lg:grid-cols-12 focus:outline-none"
          >
            {/* Left Image Frame */}
            <div className="relative aspect-[16/11] w-full overflow-hidden bg-[var(--surface-subtle)] lg:col-span-5 lg:aspect-auto lg:min-h-[340px]">
              <img
                src={project.image}
                alt={`${project.title} — ${project.subtitle}`}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
              />
              <span className="absolute left-4 top-4 rounded-full border border-white/25 bg-black/55 px-3 py-1 font-mono-meta text-[10px] uppercase tracking-wider text-white backdrop-blur-md">
                {project.statusBadge}
              </span>
            </div>

            {/* Right Technical Summary */}
            <div className="flex flex-col justify-between p-6 sm:p-8 lg:col-span-7">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 font-mono-meta text-[11px] uppercase tracking-[0.12em] text-[var(--text-muted)]">
                    <span className="text-[var(--accent)]">{project.code}</span>
                    <span>·</span>
                    <span>{project.domain}</span>
                  </div>
                  <span className="font-mono-meta text-xs text-[var(--text-muted)]">
                    {project.year}
                  </span>
                </div>

                <h3 className="mt-3 font-serif-display text-3xl leading-tight text-[var(--text)] transition-colors group-hover:text-[var(--accent)] sm:text-4xl">
                  {project.title}
                </h3>
                <p className="mt-1 text-sm font-medium text-[var(--text-secondary)]">
                  {project.subtitle}
                </p>

                <p className="mt-4 text-sm leading-relaxed text-[var(--text-secondary)] sm:text-[15px]">
                  {project.summary}
                </p>

                {/* Key Telemetry Metrics */}
                {project.outcomes.length > 0 && (
                  <div className="mt-6 grid grid-cols-3 gap-3 border-y border-[var(--border)] py-4">
                    {project.outcomes.map((item) => (
                      <div key={item.label}>
                        <p className="font-mono-meta text-sm font-semibold text-[var(--text)] sm:text-base">
                          {item.value}
                        </p>
                        <p className="mt-0.5 font-mono-meta text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                          {item.label}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Stack Chips + Inspect Specs Prompt */}
              <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap gap-1.5">
                  {project.stack.slice(0, 4).map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-[var(--border)] bg-[var(--bg)] px-2.5 py-0.5 font-mono-meta text-[11px] text-[var(--text-secondary)]"
                    >
                      {item}
                    </span>
                  ))}
                  {project.stack.length > 4 && (
                    <span className="rounded-full border border-[var(--border)] bg-[var(--bg)] px-2.5 py-0.5 font-mono-meta text-[11px] text-[var(--text-muted)]">
                      +{project.stack.length - 4} more
                    </span>
                  )}
                </div>

                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--accent)]">
                  <Cpu className="h-3.5 w-3.5" />
                  <span>Inspect Architecture</span>
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
