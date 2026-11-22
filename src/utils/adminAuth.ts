export const ADMIN_USERNAME = 'Rahas';
const ADMIN_PASSWORD = 'Rahas452010';

const SESSION_KEY = 'rahas_admin_session_v1';

export function checkCredentials(username: string, password: string): boolean {
  return username.trim() === ADMIN_USERNAME && password === ADMIN_PASSWORD;
}

export function createSession(): void {
  try {
    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({ user: ADMIN_USERNAME, loginAt: new Date().toISOString() })
    );
  } catch {
    // ignore
  }
}

export function destroySession(): void {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    // ignore
  }
}

export function isAuthenticated(): boolean {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return parsed?.user === ADMIN_USERNAME;
  } catch {
    return false;
  }
}

export function getSessionInfo(): { user: string; loginAt: string } | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
