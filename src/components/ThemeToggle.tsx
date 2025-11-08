/**
 * ThemeToggle Component
 * Provides a button to toggle between light and dark themes
 */

import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

interface ThemeToggleProps {
  /** Additional CSS classes */
  className?: string;
  /** Show text label alongside icon */
  showLabel?: boolean;
}

/**
 * A toggle button component for switching between light and dark themes
 *
 * @example
 * ```tsx
 * // Simple icon-only toggle
 * <ThemeToggle />
 *
 * // With label
 * <ThemeToggle showLabel />
 *
 * // With custom styling
 * <ThemeToggle className="ml-4" />
 * ```
 */
export function ThemeToggle({ className = '', showLabel = false }: ThemeToggleProps) {
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${className}`}
      aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
      type="button"
    >
      {resolvedTheme === 'dark' ? (
        <>
          <Sun className="h-5 w-5" />
          {showLabel && <span>Light Mode</span>}
        </>
      ) : (
        <>
          <Moon className="h-5 w-5" />
          {showLabel && <span>Dark Mode</span>}
        </>
      )}
    </button>
  );
}
