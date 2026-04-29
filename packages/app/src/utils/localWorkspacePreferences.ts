/**
 * Browser-only UI preferences (recent nav, favorites, guided setup, chat transcripts).
 * Does not touch Supabase session, theme, or i18n.
 */

const EXACT_KEYS = ['vendorsoluce_recent_items', 'vendorsoluce_favorites', 'vs-setup-completed-steps'] as const;
const CHAT_PREFIX = 'vendorsoluce_chat_';

export type LocalWorkspacePreferencesSnapshot = {
  version: 1;
  exportedAt: string;
  vendorsoluce_recent_items: string | null;
  vendorsoluce_favorites: string | null;
  vs_setup_completed_steps: string | null;
  chatKeys: Record<string, string | null>;
};

function readExact(key: (typeof EXACT_KEYS)[number]): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function collectChatEntries(): Record<string, string | null> {
  const out: Record<string, string | null> = {};
  if (typeof window === 'undefined') return out;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(CHAT_PREFIX)) {
        out[k] = localStorage.getItem(k);
      }
    }
  } catch {
    // ignore
  }
  return out;
}

export function collectLocalWorkspacePreferences(): LocalWorkspacePreferencesSnapshot {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    vendorsoluce_recent_items: readExact('vendorsoluce_recent_items'),
    vendorsoluce_favorites: readExact('vendorsoluce_favorites'),
    vs_setup_completed_steps: readExact('vs-setup-completed-steps'),
    chatKeys: collectChatEntries(),
  };
}

export function clearLocalWorkspacePreferences(): { clearedKeys: string[] } {
  const cleared: string[] = [];
  if (typeof window === 'undefined') return { clearedKeys: cleared };

  const remove = (key: string) => {
    try {
      if (localStorage.getItem(key) !== null) {
        localStorage.removeItem(key);
        cleared.push(key);
      }
    } catch {
      // ignore
    }
  };

  for (const key of EXACT_KEYS) remove(key);

  try {
    const chatKeys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(CHAT_PREFIX)) chatKeys.push(k);
    }
    chatKeys.forEach(remove);
  } catch {
    // ignore
  }

  return { clearedKeys: cleared };
}

export function applyLocalWorkspacePreferencesSnapshot(data: LocalWorkspacePreferencesSnapshot): void {
  if (typeof window === 'undefined' || data.version !== 1) return;
  const set = (key: string, value: string | null) => {
    if (value == null) {
      try {
        localStorage.removeItem(key);
      } catch {
        // ignore
      }
      return;
    }
    try {
      localStorage.setItem(key, value);
    } catch {
      // ignore
    }
  };

  if (data.vendorsoluce_recent_items !== undefined) set('vendorsoluce_recent_items', data.vendorsoluce_recent_items);
  if (data.vendorsoluce_favorites !== undefined) set('vendorsoluce_favorites', data.vendorsoluce_favorites);
  if (data.vs_setup_completed_steps !== undefined) set('vs-setup-completed-steps', data.vs_setup_completed_steps);

  for (const [k, v] of Object.entries(data.chatKeys ?? {})) {
    if (k.startsWith(CHAT_PREFIX)) set(k, v);
  }
}
