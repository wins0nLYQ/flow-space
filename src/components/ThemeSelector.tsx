/**
 * ThemeSelector Component
 * Dropdown menu for selecting theme preference (light, dark, or system)
 */

import { Moon, Sun, Monitor, Check } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import type { Theme } from '../lib/theme';

interface ThemeSelectorProps {
  /** Additional CSS classes */
  className?: string;
}

interface ThemeOption {
  value: Theme;
  label: string;
  icon: typeof Sun;
}

const themeOptions: ThemeOption[] = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
];

/**
 * A dropdown selector component for choosing theme preference
 *
 * @example
 * ```tsx
 * // In your header or settings menu
 * <ThemeSelector />
 *
 * // With custom styling
 * <ThemeSelector className="ml-auto" />
 * ```
 */
export function ThemeSelector({ className = '' }: ThemeSelectorProps) {
  const { theme, setTheme } = useTheme();

  return (
    <div className={`relative inline-block text-left ${className}`}>
      <div className="flex flex-col gap-1 rounded-md border border-border bg-card p-1">
        {themeOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = theme === option.value;

          return (
            <button
              key={option.value}
              onClick={() => setTheme(option.value)}
              className={`flex items-center gap-2 rounded px-3 py-2 text-sm transition-colors ${
                isSelected
                  ? 'bg-accent text-accent-foreground font-medium'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
              type="button"
              aria-label={`Set theme to ${option.label}`}
              aria-pressed={isSelected}
            >
              <Icon className="h-4 w-4" />
              <span className="flex-1 text-left">{option.label}</span>
              {isSelected && <Check className="h-4 w-4" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
