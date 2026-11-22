import React, { useState, useEffect } from 'react';
import { Moon, Sun, Menu, X, Lock, LayoutDashboard, LogOut } from 'lucide-react';
import { SiteProfile } from '../data/siteData';

interface NavbarProps {
  profile: SiteProfile;
  theme: 'light' | 'dark';
  isAdmin: boolean;
  onToggleTheme: () => void;
  onOpenAdmin: () => void;
  onLogout: () => void;
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
  isAdmin,
  onToggleTheme,
  onOpenAdmin,
  onLogout,
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
        <a
          href="#top"
          className="group flex items-center gap-3 focus:outline-none"
          aria-label={`${profile.name} home`}
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-strong)] bg-[var(--surface)] font-serif-display text-lg tracking-tight text-[var(--text)] transition-colors group-hover:border-[var(--accent)] group-hover:text-[var(--accent)]">
            {profile.monogram || profile.name.slice(0, 2).toUpperCase()}
          </span>
          <div className="flex flex-col">
            <span className="flex items-center gap-1.5 text-sm font-semibold leading-tight tracking-tight text-[var(--text)]">
              {profile.name}
              {isAdmin && (
                <span className="rounded-full bg-[var(--accent-soft)] px-1.5 py-0.5 font-mono-meta text-[9px] font-medium uppercase tracking-wider text-[var(--accent)]">
                  Admin
                </span>
              )}
            </span>
            <span className="hidden font-mono-meta text-[10px] text-[var(--text-muted)] sm:inline">
              Independent Researcher
            </span>
          </div>
        </a>

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

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenAdmin}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all cursor-pointer ${
              isAdmin
                ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)] hover:opacity-90'
                : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--text)]'
            }`}
            title={isAdmin ? 'Open admin studio' : 'Admin login'}
          >
            {isAdmin ? (
              <>
                <LayoutDashboard className="h-3.5 w-3.5" />
                <span>Studio</span>
              </>
            ) : (
              <>
                <Lock className="h-3.5 w-3.5" />
                <span>Admin</span>
              </>
            )}
          </button>

          {isAdmin && (
            <button
              type="button"
              onClick={onLogout}
              className="hidden h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] transition-colors hover:border-red-300 hover:text-red-600 sm:flex cursor-pointer"
              aria-label="Log out admin"
              title="Log out"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          )}

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
