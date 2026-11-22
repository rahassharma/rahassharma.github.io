import React, { useState } from 'react';
import { ArrowUpRight, Check, Copy, Mail, MapPin, Send } from 'lucide-react';
import { SiteProfile } from '../data/siteData';

interface ContactSectionProps {
  profile: SiteProfile;
  onOpenCustomize: () => void;
}

export const ContactSection: React.FC<ContactSectionProps> = ({
  profile,
  onOpenCustomize,
}) => {
  const [copied, setCopied] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
    } catch {
      // fallback ignore
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;
    setSubmitted(true);
  };

  return (
    <>
      <section
        id="contact"
        className="mx-auto max-w-6xl border-t border-[var(--border)] px-6 py-20 sm:px-8 sm:py-28"
      >
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Left Invite Column */}
          <div className="lg:col-span-6">
            <p className="font-mono-meta text-[11px] uppercase tracking-[0.16em] text-[var(--accent)]">
              05 / Contact & Correspondence
            </p>
            <h2 className="mt-3 font-serif-display text-4xl leading-[1.08] text-[var(--text)] sm:text-5xl">
              Research inquiries,{' '}
              <span className="italic text-[var(--accent)]">field trials</span>{' '}
              & collaborations.
            </h2>
            <p className="mt-5 max-w-md text-base leading-relaxed text-[var(--text-secondary)]">
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

            {/* Public Links & Institution */}
            <div className="mt-10 space-y-5 border-t border-[var(--border)] pt-7">
              <div>
                <p className="font-mono-meta text-[10px] uppercase tracking-[0.14em] text-[var(--text-muted)]">
                  Public Code & Open Data
                </p>
                <a
                  href={profile.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group mt-1.5 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--text)] transition-colors hover:text-[var(--accent)]"
                >
                  <span>{profile.githubHandle}</span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-[var(--text-muted)] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--accent)]" />
                </a>
                <p className="mt-1 text-xs leading-relaxed text-[var(--text-muted)]">
                  {profile.githubNote}
                </p>
              </div>

              <div>
                <p className="font-mono-meta text-[10px] uppercase tracking-[0.14em] text-[var(--text-muted)]">
                  Affiliation
                </p>
                <p className="mt-1.5 flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-[var(--accent)]" />
                  <span>
                    {profile.institution}, {profile.location}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Right Quick Note Form */}
          <div className="lg:col-span-6">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8">
              {submitted ? (
                <div className="flex min-h-[290px] flex-col items-start justify-center">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
                    <Check className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 font-serif-display text-3xl text-[var(--text)]">
                    Message prepared, {name.split(' ')[0]}.
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                    Thank you for writing. For immediate correspondence, you can
                    also email directly at{' '}
                    <a
                      href={`mailto:${profile.email}`}
                      className="font-medium text-[var(--accent)] hover:underline"
                    >
                      {profile.email}
                    </a>
                    .
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      setName('');
                      setEmail('');
                      setMessage('');
                    }}
                    className="mt-6 text-xs font-medium text-[var(--accent)] hover:underline cursor-pointer"
                  >
                    Write another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label
                      htmlFor="contact-name"
                      className="block font-mono-meta text-[11px] uppercase tracking-[0.12em] text-[var(--text-muted)]"
                    >
                      Your Name
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Dr. Ananya Rao"
                      className="mt-2 w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-2.5 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="contact-email"
                      className="block font-mono-meta text-[11px] uppercase tracking-[0.12em] text-[var(--text-muted)]"
                    >
                      Email Address
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@institution.edu"
                      className="mt-2 w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-2.5 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="contact-message"
                      className="block font-mono-meta text-[11px] uppercase tracking-[0.12em] text-[var(--text-muted)]"
                    >
                      Message
                    </label>
                    <textarea
                      id="contact-message"
                      rows={4}
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Share details regarding research collaboration, ASTRA/Aarogya Kavach inquiries, or field deployments..."
                      className="mt-2 w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-2.5 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[var(--accent-hover)] cursor-pointer"
                  >
                    <span>Send Inquiry</span>
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </form>
              )}
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
