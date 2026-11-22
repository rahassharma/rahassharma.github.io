import React from 'react';
import { Cpu, ShieldCheck, Sliders, Users } from 'lucide-react';
import { SiteProfile } from '../data/siteData';

interface MissionSectionProps {
  profile: SiteProfile;
}

const PILLAR_ICONS = [Sliders, ShieldCheck, Cpu];

export const MissionSection: React.FC<MissionSectionProps> = ({ profile }) => {
  return (
    <section
      id="mission"
      className="mx-auto max-w-6xl border-t border-[var(--border)] px-6 py-20 sm:px-8 sm:py-28"
    >
      <p className="font-mono-meta text-[11px] uppercase tracking-[0.16em] text-[var(--accent)]">
        01 / Bio & Research Mission
      </p>

      <div className="mt-6 grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-14">
        {/* Left: Verbatim Mission Statement */}
        <div className="lg:col-span-7">
          <h2 className="font-serif-display text-3xl leading-[1.15] text-[var(--text)] sm:text-4xl lg:text-[2.65rem]">
            Engineering for the people commercial technology{' '}
            <span className="italic text-[var(--accent)]">overlooks.</span>
          </h2>

          <blockquote className="mt-7 border-l-2 border-[var(--accent)] pl-6 text-base leading-[1.82] text-[var(--text-secondary)] sm:text-[17px]">
            &ldquo;{profile.missionStatement}&rdquo;
          </blockquote>

          {/* Three Engineering Philosophy Pillars */}
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {profile.philosophyPillars.map((pillar, idx) => {
              const Icon = PILLAR_ICONS[idx % PILLAR_ICONS.length];
              return (
                <div
                  key={pillar.title}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent)]">
                    <Icon className="h-4 w-4" />
                  </div>
                  <h3 className="mt-4 text-sm font-semibold text-[var(--text)]">
                    {pillar.title}
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-[var(--text-secondary)]">
                    {pillar.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Who We Build For Card */}
        <div className="lg:col-span-5">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
              <div className="flex items-center gap-2.5">
                <Users className="h-4 w-4 text-[var(--accent)]" />
                <h3 className="font-serif-display text-2xl text-[var(--text)]">
                  Built For Real Constraints
                </h3>
              </div>
              <span className="font-mono-meta text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                Field First
              </span>
            </div>

            <div className="mt-6 space-y-5">
              {profile.demographicsServed.map((item, idx) => (
                <div key={item.label} className="flex items-start gap-3.5">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[var(--border-strong)] font-mono-meta text-[11px] text-[var(--accent)]">
                    0{idx + 1}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-[var(--text)]">
                      {item.label}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-[var(--text-secondary)]">
                      {item.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-7 rounded-xl border border-[var(--border)] bg-[var(--bg)] p-4">
              <p className="font-mono-meta text-[10px] uppercase tracking-[0.14em] text-[var(--text-muted)]">
                Reproducibility & Open Science
              </p>
              <p className="mt-1.5 text-xs leading-relaxed text-[var(--text-secondary)]">
                {profile.githubNote}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
