import React, { useState } from 'react';
import { BookMarked, Check, Copy, FileText, Info } from 'lucide-react';
import { Publication } from '../data/siteData';

interface PublicationsSectionProps {
  publications: Publication[];
}

export const PublicationsSection: React.FC<PublicationsSectionProps> = ({
  publications,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [openBibtexId, setOpenBibtexId] = useState<string | null>(null);

  const handleCopyBibtex = async (pub: Publication) => {
    try {
      await navigator.clipboard.writeText(pub.bibtex);
    } catch {
      // fallback ignore
    }
    setCopiedId(pub.id);
    setTimeout(() => setCopiedId(null), 2200);
  };

  return (
    <section
      id="publications"
      className="mx-auto max-w-6xl border-t border-[var(--border)] px-6 py-20 sm:px-8 sm:py-28"
    >
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="font-mono-meta text-[11px] uppercase tracking-[0.16em] text-[var(--accent)]">
            02 / Peer-Reviewed Publications
          </p>
          <h2 className="mt-3 font-serif-display text-4xl leading-[1.08] text-[var(--text)] sm:text-5xl">
            Accepted <span className="italic">IEEE</span> research
          </h2>
        </div>
        <p className="max-w-xs text-sm text-[var(--text-secondary)]">
          Independent sole-author manuscripts reviewed under international IEEE
          conference standards.
        </p>
      </div>

      {/* Publication Cards */}
      <div className="mt-12 space-y-6">
        {publications.map((pub) => {
          const isCopied = copiedId === pub.id;
          const isBibOpen = openBibtexId === pub.id;

          return (
            <article
              key={pub.id}
              className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 transition-colors hover:border-[var(--border-strong)] sm:p-8"
            >
              {/* Top Meta Row */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="font-mono-meta text-sm font-semibold text-[var(--accent)]">
                    {pub.indexLabel}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--accent-soft)] px-3 py-1 font-mono-meta text-[11px] font-medium text-[var(--accent)]">
                    <FileText className="h-3 w-3" />
                    {pub.status}
                  </span>
                  <span className="rounded-full border border-[var(--border)] bg-[var(--bg)] px-3 py-1 font-mono-meta text-[11px] text-[var(--text-secondary)]">
                    {pub.role}
                  </span>
                </div>
                <span className="font-mono-meta text-xs text-[var(--text-muted)]">
                  {pub.year}
                </span>
              </div>

              {/* Paper Title */}
              <h3 className="mt-5 font-serif-display text-2xl leading-[1.2] text-[var(--text)] sm:text-3xl">
                {pub.title}
              </h3>

              {/* Venue */}
              <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-medium text-[var(--text-secondary)]">
                <BookMarked className="h-4 w-4 text-[var(--accent)]" />
                <span>{pub.venue}</span>
                <span className="text-[var(--text-muted)]">·</span>
                <span className="text-[var(--text-muted)]">{pub.location}</span>
              </p>

              {/* Abstract / Summary */}
              <p className="mt-4 text-sm leading-[1.78] text-[var(--text-secondary)] sm:text-[15px]">
                {pub.abstract}
              </p>

              {/* Optional Academic Note */}
              {pub.note && (
                <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-xs leading-relaxed text-[var(--text-secondary)]">
                  <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--accent)]" />
                  <span>
                    <strong className="font-medium text-[var(--text)]">Note:</strong>{' '}
                    {pub.note}
                  </span>
                </div>
              )}

              {/* Bottom Tags + BibTeX Controls */}
              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-[var(--border)] pt-5">
                <div className="flex flex-wrap gap-2">
                  {pub.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-[var(--border)] bg-[var(--bg)] px-2.5 py-0.5 font-mono-meta text-[11px] text-[var(--text-muted)]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setOpenBibtexId(isBibOpen ? null : pub.id)
                    }
                    className="rounded-full border border-[var(--border)] bg-[var(--bg)] px-3.5 py-1.5 font-mono-meta text-[11px] text-[var(--text-secondary)] transition-colors hover:border-[var(--border-strong)] hover:text-[var(--text)] cursor-pointer"
                  >
                    {isBibOpen ? 'Hide BibTeX' : 'BibTeX'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopyBibtex(pub)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-strong)] bg-[var(--surface)] px-3.5 py-1.5 font-mono-meta text-[11px] text-[var(--text)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)] cursor-pointer"
                  >
                    {isCopied ? (
                      <>
                        <Check className="h-3 w-3 text-[var(--accent)]" />
                        <span className="text-[var(--accent)]">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span>Copy Citation</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Expandable BibTeX Code */}
              {isBibOpen && (
                <pre className="mt-4 overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--bg)] p-4 font-mono-meta text-xs leading-relaxed text-[var(--text-secondary)]">
                  <code>{pub.bibtex}</code>
                </pre>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
};
