import React, { useState } from 'react';
import { ArrowUpRight, Check, Copy, Mail, MapPin } from 'lucide-react';
import { SiteProfile } from '../data/siteData';
import { SocialIcon } from './SocialIcons';

interface ContactSectionProps {
  profile: SiteProfile;
  onOpenCustomize: () => void;
}

export const ContactSection: React.FC<ContactSectionProps> = ({
  profile,
  onOpenCustomize,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
    } catch {
      // fallback ignore
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <>
      <section
        id="contact"
        className="mx-auto max-w-6xl border-t border-[var(--border)] px-6 py-20 sm:px-8 sm:py-28"
      >
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Left Invite Column */}
          <div className="lg:col-span-7">
            <p className="font-mono-meta text-[11px] uppercase tracking-[0.16em] text-[var(--accent)]">
              05 / Contact & Correspondence
            </p>
            <h2 className="mt-3 font-serif-display text-4xl leading-[1.08] text-[var(--text)] sm:text-5xl">
              Research inquiries,{' '}
              <span className="italic text-[var(--accent)]">field trials</span>{' '}
              & collaborations.
            </h2>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-[var(--text-secondary)]">
              I welcome correspondence from researchers, mentors, agricultural
              extension teams, and public-health engineers interested in
              offline-first edge architectures and open reproducibility.
            </p>

            {/* Direct Email Block */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href={`mailto:${profile.email}`}
                className="inline-flex items-center gap-2 rounded-full bg-[var(--text)] px-5 py-2.5 text-sm font-medium text-[var(--bg)] transition-opacity hover:opacity-90"
              >
                <Mail className="h-4 w-4" />
                <span>{profile.email}</span>
              </a>

              <button
                type="button"
                onClick={handleCopyEmail}
                className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-strong)] bg-[var(--surface)] px-4 py-2.5 text-xs font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--text)] hover:text-[var(--text)] cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-[var(--accent)]" />
                    <span className="text-[var(--accent)]">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy email</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Public Links & Affiliation Card */}
          <div className="lg:col-span-5">
            <div className="space-y-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8">
              <div>
                <p className="font-mono-meta text-[10px] uppercase tracking-[0.14em] text-[var(--text-muted)]">
                  Public Code & Open Data
                </p>
                <a
                  href={profile.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group mt-2 inline-flex items-center gap-1.5 text-base font-medium text-[var(--text)] transition-colors hover:text-[var(--accent)]"
                >
                  <span>{profile.githubHandle}</span>
                  <ArrowUpRight className="h-4 w-4 text-[var(--text-muted)] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--accent)]" />
                </a>
                <p className="mt-1.5 text-xs leading-relaxed text-[var(--text-muted)]">
                  {profile.githubNote}
                </p>
              </div>

              {(profile.socialLinks || []).some(
                (s) => s.enabled && s.url.trim().length > 0
              ) && (
                <div className="border-t border-[var(--border)] pt-6">
                  <p className="font-mono-meta text-[10px] uppercase tracking-[0.14em] text-[var(--text-muted)]">
                    Social & Academic Profiles
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(profile.socialLinks || [])
                      .filter((s) => s.enabled && s.url.trim().length > 0)
                      .map((social) => (
                        <a
                          key={social.id}
                          href={social.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--bg)] px-3.5 py-2 text-xs font-medium text-[var(--text)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
                        >
                          <SocialIcon
                            platform={social.platform}
                            className="h-3.5 w-3.5 text-[var(--accent)]"
                          />
                          <span>{social.label}</span>
                          <ArrowUpRight className="h-3 w-3 text-[var(--text-muted)] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--accent)]" />
                        </a>
                      ))}
                  </div>
                </div>
              )}

              <div className="border-t border-[var(--border)] pt-6">
                <p className="font-mono-meta text-[10px] uppercase tracking-[0.14em] text-[var(--text-muted)]">
                  Affiliation & Location
                </p>
                <p className="mt-2 flex items-start gap-2 text-sm text-[var(--text)]">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent)]" />
                  <span>
                    {profile.institution}
                    <span className="block text-xs text-[var(--text-secondary)]">
                      {profile.location}
                    </span>
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Minimal Academic Colophon Footer */}
      <footer className="border-t border-[var(--border)]">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-6 py-8 text-xs text-[var(--text-muted)] sm:flex-row sm:items-center sm:px-8">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span className="font-medium text-[var(--text-secondary)]">
              © {new Date().getFullYear()} {profile.name}
            </span>
            <span>·</span>
            <span className="font-mono-meta text-[11px]">
              Edge Computing & Humanitarian Technology
            </span>
          </div>

          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={onOpenCustomize}
              className="transition-colors hover:text-[var(--text)] cursor-pointer"
            >
              Edit profile
            </button>
            <a href="#top" className="transition-colors hover:text-[var(--text)]">
              Back to top ↑
            </a>
          </div>
        </div>
      </footer>
    </>
  );
};
