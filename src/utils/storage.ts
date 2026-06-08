export function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;

  try {
    if (!window.localStorage) return fallback;
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeStorage<T>(key: string, value: T) {
  if (typeof window === 'undefined') return;

  try {
    if (!window.localStorage) return;
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage can be blocked in embedded browsers or private contexts.
  }
}
