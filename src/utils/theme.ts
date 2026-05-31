export type Theme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'vs-theme';

export const getStoredTheme = (): Theme => {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'dark' || stored === 'light') return stored;
  } catch {
    /* ignore */
  }

  if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }

  return 'light';
};

export const applyTheme = (theme: Theme): void => {
  document.documentElement.setAttribute('data-theme', theme);
  document.documentElement.style.colorScheme = theme;

  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    /* ignore */
  }
};

/** Call before first paint to avoid theme flash. */
export const initTheme = (): Theme => {
  const theme = getStoredTheme();
  applyTheme(theme);
  return theme;
};

export const toggleTheme = (current: Theme): Theme => {
  const next: Theme = current === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  return next;
};

export const readThemeToken = (name: string, fallback = ''): string => {
  if (typeof window === 'undefined') return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
};
