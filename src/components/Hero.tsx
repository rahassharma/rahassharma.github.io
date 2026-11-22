import React, { useEffect, useState } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  GraduationCap,
  Mail,
  MapPin,
} from 'lucide-react';
import { SiteProfile } from '../data/siteData';
import { SocialIcon } from './SocialIcons';

interface HeroProps {
  profile: SiteProfile;
}

export const Hero: React.FC<HeroProps> = ({ profile }) => {
  const [localTime, setLocalTime] = useState<string>('');

  useEffect(() => {
    const updateClock = () => {
      try {
        const now = new Date();
        const formatted = new Intl.DateTimeFormat('en-IN', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
          timeZone: profile.timezone || 'Asia/Kolkata',
        }).format(now);
        setLocalTime(`${formatted} IST`);
      } catch {
        const now = new Date();
        setLocalTime(
          now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
        );
      }
    };
    updateClock();
    const timer = setInterval(updateClock, 30000);
    return () => clearInterval(timer);
  }, [profile.timezone]);

  return (
    <section
      id="top"
      className="relative mx-auto max-w-6xl px-6 pb-20 pt-10 sm:px-8 sm:pb-28 sm:pt-14 lg:pt-18"
    >
      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-14">
        {/* Left Editorial Column */}
        <div className="lg:col-span-7">
          {/* Status Pill */}
          <div className="animate-fade-up mb-7 inline-flex items-center gap-2.5 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3.5 py-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--accent)] opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--accent)]" />
            </span>
            <span className="font-mono-meta text-[11px] tracking-wide text-[var(--text-secondary)]">
              {profile.currentStatus}
            </span>
          </div>

          {/* Researcher Name + Tagline Eyebrow */}
          <div className="animate-fade-up-delay-1">
            <p className="font-mono-meta text-xs font-medium uppercase tracking-[0.14em] text-[var(--accent)]">
              {profile.name}
            </p>
            <p className="mt-1.5 text-sm font-medium text-[var(--text-secondary)] sm:text-base">
              {profile.tagline}
            </p>
          </div>

          {/* Editorial Display Headline */}
          <h1 className="animate-fade-up-delay-1 mt-5 font-serif-display text-[2.95rem] leading-[1.04] tracking-[-0.02em] text-[var(--text)] sm:text-[4rem] lg:text-[4.45rem]">
            {profile.headlineStart}{' '}
            <span className="italic text-[var(--accent)]">
              {profile.headlineAccent}
            </span>{' '}
            {profile.headlineEnd}
          </h1>

          {/* Concise Credentials Summary */}
          <p className="animate-fade-up-delay-2 mt-6 max-w-xl text-base leading-relaxed text-[var(--text-secondary)] sm:text-[17px] sm:leading-[1.72]">
            {profile.heroSummary}
          </p>

          {/* CTA Group */}
          <div className="animate-fade-up-delay-3 mt-8 flex flex-wrap items-center gap-3.5">
            <a
              href="#publications"
              className="group inline-flex items-center gap-2 rounded-full bg-[var(--text)] px-6 py-3 text-sm font-medium text-[var(--bg)] transition-all hover:opacity-90"
            >
              <span>Peer-Reviewed Papers</span>
              <ArrowDownRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:translate-y-0.5" />
            </a>

            <a
              href="#projects"
              className="group inline-flex items-center gap-2 rounded-full border border-[var(--border-strong)] bg-transparent px-5 py-3 text-sm font-medium text-[var(--text)] transition-colors hover:border-[var(--text)] hover:bg-[var(--surface)]"
            >
              <span>Engineering Portfolio</span>
              <ArrowUpRight className="h-4 w-4 text-[var(--text-muted)] transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--text)]" />
            </a>

            <a
              href={profile.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-xs font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--border-strong)] hover:text-[var(--text)]"
              title="Public GitHub profile"
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.57.1.78-.25.78-.55 0-.27-.01-1.17-.02-2.12-3.2.69-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.55-.29-5.23-1.28-5.23-5.68 0-1.25.45-2.28 1.18-3.08-.12-.29-.51-1.46.11-3.04 0 0 .97-.31 3.17 1.18a10.95 10.95 0 0 1 5.78 0c2.2-1.49 3.17-1.18 3.17-1.18.62 1.58.23 2.75.11 3.04.74.8 1.18 1.83 1.18 3.08 0 4.41-2.69 5.39-5.25 5.67.41.36.78 1.06.78 2.14 0 1.55-.01 2.8-.01 3.18 0 .31.21.66.79.55A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
              </svg>
              <span>GitHub</span>
            </a>

            {(profile.socialLinks || [])
              .filter((s) => s.enabled && s.url.trim().length > 0)
              .map((social) => (
                <a
                  key={social.id}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-xs font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
                  title={social.label}
                >
                  <SocialIcon platform={social.platform} className="h-4 w-4" />
                  <span>{social.label}</span>
                </a>
              ))}
          </div>

          {/* Academic & Location Metadata Strip */}
          <div className="animate-fade-up-delay-3 mt-11 grid grid-cols-1 gap-5 border-t border-[var(--border)] pt-6 sm:grid-cols-2">
            <div>
              <p className="font-mono-meta text-[10px] uppercase tracking-[0.14em] text-[var(--text-muted)]">
                Institution & Location
              </p>
              <p className="mt-1.5 flex items-start gap-2 text-sm font-medium text-[var(--text)]">
                <GraduationCap className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent)]" />
                <span>{profile.institution}</span>
              </p>
              <p className="mt-1 flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-[var(--text-muted)]" />
                <span>
                  {profile.location}
                  {localTime && (
                    <span className="font-mono-meta text-[11px] text-[var(--text-muted)]">
                      {' '}
                      · {localTime}
                    </span>
                  )}
                </span>
              </p>
            </div>

            <div>
              <p className="font-mono-meta text-[10px] uppercase tracking-[0.14em] text-[var(--text-muted)]">
                Direct Contact
              </p>
              <a
                href={`mailto:${profile.email}`}
                className="mt-1.5 inline-flex items-center gap-2 text-sm font-medium text-[var(--text)] transition-colors hover:text-[var(--accent)]"
              >
                <Mail className="h-3.5 w-3.5 text-[var(--accent)]" />
                <span>{profile.email}</span>
              </a>
              <p className="mt-1 font-mono-meta text-[11px] text-[var(--text-muted)]">
                {profile.githubHandle}
              </p>
            </div>
          </div>
        </div>

        {/* Right Hardware Research Bench Visual */}
        <div className="animate-fade-up-delay-2 lg:col-span-5">
          <figure className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-2.5 shadow-[0_12px_40px_-16px_rgba(23,22,20,0.08)]">
            <div className="aspect-[4/5] w-full overflow-hidden rounded-xl bg-[var(--surface-subtle)]">
              <img
                src={profile.heroImage || '/images/hero-lab.jpg'}
                alt={
                  profile.heroImageAlt ||
                  'Edge computing and sensor fusion hardware research bench'
                }
                style={{
                  objectPosition: profile.heroImagePosition || '50% 50%',
                  transform:
                    profile.heroImageZoom && profile.heroImageZoom !== 1
                      ? `scale(${profile.heroImageZoom})`
                      : undefined,
                }}
                className={`h-full w-full transition-transform duration-700 ${
                  profile.heroImageFit === 'contain'
                    ? 'object-contain'
                    : 'object-cover'
                } ${
                  !profile.heroImageZoom || profile.heroImageZoom === 1
                    ? 'hover:scale-[1.03]'
                    : ''
                }`}
              />
            </div>
            <figcaption className="flex items-center justify-between gap-2 px-2 pb-1 pt-3">
              <span className="font-mono-meta text-[11px] text-[var(--text-muted)]">
                {profile.heroImageCaption || 'FIG. 01 — EDGE HARDWARE BENCH'}
              </span>
              <span className="shrink-0 font-mono-meta text-[11px] text-[var(--text-secondary)]">
                {profile.coordinates}
              </span>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
};
