import React, { useEffect, useState } from 'react';
import { X, Lock, User, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { checkCredentials, createSession } from '../utils/adminAuth';

interface AdminLoginModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    if (!open) return;
    setError('');
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (checkCredentials(username, password)) {
      createSession();
      setUsername('');
      setPassword('');
      setError('');
      setAttempts(0);
      onSuccess();
    } else {
      setAttempts((a) => a + 1);
      setError('Invalid username or password. Please try again.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Admin login"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
              <Lock className="h-4 w-4" />
            </span>
            <div>
              <h2 className="font-serif-display text-xl leading-tight text-[var(--text)]">
                Admin Login
              </h2>
              <p className="font-mono-meta text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)]">
                Restricted site controls
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--text)] cursor-pointer"
            aria-label="Close login"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-6">
          <div className="flex items-start gap-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3.5 py-3 text-xs leading-relaxed text-[var(--text-secondary)]">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent)]" />
            <span>
              Sign in to unlock granular editing for profile, publications,
              projects, honors, theme and backups.
            </span>
          </div>

          <div>
            <label
              htmlFor="admin-username"
              className="block font-mono-meta text-[11px] uppercase tracking-[0.12em] text-[var(--text-muted)]"
            >
              Username
            </label>
            <div className="relative mt-1.5">
              <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                id="admin-username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter admin username"
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] py-2.5 pl-10 pr-3.5 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="admin-password"
              className="block font-mono-meta text-[11px] uppercase tracking-[0.12em] text-[var(--text-muted)]"
            >
              Password
            </label>
            <div className="relative mt-1.5">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] py-2.5 pl-10 pr-11 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-2.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-[var(--text-muted)] hover:text-[var(--text)] cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
              {error}
              {attempts >= 3 && (
                <span className="mt-1 block opacity-80">
                  Hint: credentials are case-sensitive.
                </span>
              )}
            </p>
          )}

          <button
            type="submit"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--text)] px-5 py-3 text-sm font-medium text-[var(--bg)] transition-opacity hover:opacity-90 cursor-pointer"
          >
            <Lock className="h-3.5 w-3.5" />
            <span>Unlock Admin Panel</span>
          </button>

          <p className="text-center font-mono-meta text-[10px] text-[var(--text-muted)]">
            Session stays active on this device until you log out.
          </p>
        </form>
      </div>
    </div>
  );
};
