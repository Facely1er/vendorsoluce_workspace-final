/**
 * Optional display name for demo / local-browser workspace sessions.
 * Stored only in this browser (not sent to Supabase). Used for greetings and the nav label.
 */
export const BROWSER_WORKSPACE_DISPLAY_NAME_KEY = 'vendorsoluce_workspace_display_name';

export const WORKSPACE_DISPLAY_NAME_EVENT = 'vs-workspace-display-name';

export function getBrowserWorkspaceDisplayName(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(BROWSER_WORKSPACE_DISPLAY_NAME_KEY);
    const t = raw?.trim();
    return t || null;
  } catch {
    return null;
  }
}

export function setBrowserWorkspaceDisplayName(name: string): void {
  const t = name.trim();
  try {
    if (!t) {
      localStorage.removeItem(BROWSER_WORKSPACE_DISPLAY_NAME_KEY);
    } else {
      localStorage.setItem(BROWSER_WORKSPACE_DISPLAY_NAME_KEY, t);
    }
    window.dispatchEvent(new CustomEvent(WORKSPACE_DISPLAY_NAME_EVENT));
  } catch {
    /* ignore quota / private mode */
  }
}

export function clearBrowserWorkspaceDisplayName(): void {
  try {
    localStorage.removeItem(BROWSER_WORKSPACE_DISPLAY_NAME_KEY);
    window.dispatchEvent(new CustomEvent(WORKSPACE_DISPLAY_NAME_EVENT));
  } catch {
    /* noop */
  }
}
