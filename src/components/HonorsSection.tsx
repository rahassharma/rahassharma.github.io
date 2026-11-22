import React from 'react';
import { Award } from 'lucide-react';
import { HonorItem } from '../data/siteData';

interface HonorsSectionProps {
  honors: HonorItem[];
}

export const HonorsSection: React.FC<HonorsSectionProps> = ({ honors }) => {
  return (
    <section
      id="honors"
      className="mx-auto max-w-6xl border-t border-[var(--border)] px-6 py-20 sm:px-8 sm:py-28"
    >
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="font-mono-meta text-[11px] uppercase tracking-[0.16em] text-[var(--accent)]">
            04 / Honors, Awards & National Recognition
          </p>
          <h2 className="mt-3 font-serif-display text-4xl leading-[1.08] text-[var(--text)] sm:text-5xl">
            National recognition & <span className="italic">field</span> milestones
          </h2>
        </div>
        <p className="max-w-xs text-sm text-[var(--text-secondary)]">
          Awards, applications, parliamentary youth leadership, and supervised
          field trials.
        </p>
      </div>

      {/* Editorial Ledger */}
      <div className="mt-12 divide-y divide-[var(--border)] border-y border-[var(--border)]">
        {honors.map((honor) => (
          <div
            key={honor.id}
            className="grid grid-cols-1 items-start gap-4 py-7 transition-colors hover:bg-[var(--surface)]/50 sm:px-3 md:grid-cols-12 md:gap-6"
          >
            {/* Year & Tag */}
            <div className="md:col-span-3">
              <span className="font-mono-meta text-sm font-semibold text-[var(--accent)]">
                {honor.year}
              </span>
              <p className="mt-1 font-mono-meta text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)]">
                {honor.shortTag}
              </p>
            </div>

            {/* Title & Distinction */}
            <div className="md:col-span-4">
              <h3 className="font-serif-display text-2xl leading-snug text-[var(--text)]">
                {honor.title}
              </h3>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--accent-soft)] px-2.5 py-0.5 font-mono-meta text-[11px] font-medium text-[var(--accent)]">
                  <Award className="h-3 w-3" />
                  {honor.distinction}
                </span>
                {honor.credentialMeta && (
                  <span className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-2.5 py-0.5 font-mono-meta text-[11px] text-[var(--text-secondary)]">
                    {honor.credentialMeta}
                  </span>
                )}
              </div>
            </div>

            {/* Details */}
            <div className="md:col-span-5">
              <p className="text-sm leading-relaxed text-[var(--text-secondary)] sm:text-[15px]">
                {honor.details}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
