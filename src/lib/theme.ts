/**
 * Theme Utility Functions
 * Handles dark mode toggling and persistence
 */

export type Theme = 'light' | 'dark' | 'system';

const THEME_STORAGE_KEY = 'flowspace-theme';

/**
 * Gets the current theme from localStorage or defaults to system preference
 */
export function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'system';

  const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
  return stored || 'system';
}

/**
 * Saves the theme preference to localStorage
 */
export function setStoredTheme(theme: Theme): void {
  if (typeof window === 'undefined') return;

  localStorage.setItem(THEME_STORAGE_KEY, theme);
}

/**
 * Gets the user's system theme preference
 */
export function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'dark';

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Resolves the actual theme to apply based on preference and system settings
 */
export function resolveTheme(theme: Theme): 'light' | 'dark' {
  if (theme === 'system') {
    return getSystemTheme();
  }
  return theme;
}

/**
 * Applies the theme by adding/removing the 'dark' class on the document element
 */
export function applyTheme(theme: 'light' | 'dark'): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;

  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

/**
 * Initializes theme on app load
 * Call this early in your app's lifecycle (e.g., in main.tsx)
 */
export function initializeTheme(): void {
  const storedTheme = getStoredTheme();
  const resolvedTheme = resolveTheme(storedTheme);
  applyTheme(resolvedTheme);
}
