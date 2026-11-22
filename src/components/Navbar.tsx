import React, { useState, useEffect } from 'react';
import { Moon, Sun, SlidersHorizontal, Menu, X } from 'lucide-react';
import { SiteProfile } from '../data/siteData';

interface NavbarProps {
  profile: SiteProfile;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onOpenCustomize: () => void;
}

const NAV_LINKS = [
  { label: 'Mission', href: '#mission' },
  { label: 'Publications', href: '#publications' },
  { label: 'Projects', href: '#projects' },
  { label: 'Honors', href: '#honors' },
  { label: 'Contact', href: '#contact' },
];

export const Navbar: React.FC<NavbarProps> = ({
  profile,
  theme,
  onToggleTheme,
  onOpenCustomize,
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'border-b border-[var(--border)] bg-[var(--bg)]/88 backdrop-blur-md'
          : 'border-b border-transparent bg-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 sm:px-8">
        {/* Brand Monogram + Name */}
        <a
          href="#top"
          className="group flex items-center gap-3 focus:outline-none"
          aria-label={`${profile.name} home`}
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-strong)] bg-[var(--surface)] font-serif-display text-lg tracking-tight text-[var(--text)] transition-colors group-hover:border-[var(--accent)] group-hover:text-[var(--accent)]">
            {profile.monogram || profile.name.slice(0, 2).toUpperCase()}
          </span>
          <div className="flex flex-col">
            <span className="text-sm font-semibold leading-tight tracking-tight text-[var(--text)]">
              {profile.name}
            </span>
            <span className="hidden font-mono-meta text-[10px] text-[var(--text-muted)] sm:inline">
              Independent Researcher
            </span>
          </div>
        </a>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-7 md:flex" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--text)]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenCustomize}
            className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3.5 py-1.5 text-xs font-medium text-[var(--text-secondary)] transition-all hover:border-[var(--border-strong)] hover:text-[var(--text)] cursor-pointer"
            title="Edit profile & appearance"
          >
            <SlidersHorizontal className="h-3.5 w-3.5 text-[var(--accent)]" />
            <span>Edit</span>
          </button>

          <button
            type="button"
            onClick={onToggleTheme}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] transition-colors hover:border-[var(--border-strong)] hover:text-[var(--text)] cursor-pointer"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] md:hidden cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Dropdown */}
      {mobileOpen && (
        <div className="border-t border-[var(--border)] bg-[var(--bg)] px-6 py-4 md:hidden">
          <nav className="flex flex-col gap-3">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="py-1.5 text-base font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text)]"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};
