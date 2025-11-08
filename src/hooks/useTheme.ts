/**
 * useTheme Hook
 * Provides theme state management with localStorage persistence
 */

import { useState, useEffect } from 'react';
import {
  type Theme,
  getStoredTheme,
  setStoredTheme,
  resolveTheme,
  applyTheme,
} from '../lib/theme';

export interface UseThemeReturn {
  /** Current theme preference ('light' | 'dark' | 'system') */
  theme: Theme;
  /** Actual resolved theme being displayed ('light' | 'dark') */
  resolvedTheme: 'light' | 'dark';
  /** Function to change the theme */
  setTheme: (theme: Theme) => void;
  /** Toggle between light and dark mode (ignores system preference) */
  toggleTheme: () => void;
}

/**
 * Hook for managing theme state and persistence
 *
 * @example
 * ```tsx
 * function ThemeToggle() {
 *   const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();
 *
 *   return (
 *     <button onClick={toggleTheme}>
 *       {resolvedTheme === 'dark' ? '🌙' : '☀️'}
 *     </button>
 *   );
 * }
 * ```
 */
export function useTheme(): UseThemeReturn {
  const [theme, setThemeState] = useState<Theme>(getStoredTheme);
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() =>
    resolveTheme(getStoredTheme())
  );

  // Apply theme changes
  useEffect(() => {
    const resolved = resolveTheme(theme);
    setResolvedTheme(resolved);
    applyTheme(resolved);
    setStoredTheme(theme);
  }, [theme]);

  // Listen for system theme changes when theme is set to 'system'
  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      const systemTheme = e.matches ? 'dark' : 'light';
      setResolvedTheme(systemTheme);
      applyTheme(systemTheme);
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    // When toggling, we ignore system preference and switch between light/dark
    const newTheme = resolvedTheme === 'dark' ? 'light' : 'dark';
    setThemeState(newTheme);
  };

  return {
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme,
  };
}
