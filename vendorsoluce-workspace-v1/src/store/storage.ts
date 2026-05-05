const STORAGE_KEY = 'vendorsoluce.workspace.v1'

export function loadJson<T>(fallback: T): T {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function saveJson<T>(value: T) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
}

export function clearWorkspaceStorage() {
  localStorage.removeItem(STORAGE_KEY)
}

