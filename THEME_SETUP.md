# Theme System Documentation

## Overview

Your FlowSpace project now has a complete theming system using TailwindCSS v4 with OKLCH color values for better perceptual uniformity. The system supports light mode, dark mode, and system preference detection.

## Why No `globals.css`?

Your project uses **TailwindCSS v4** (version 4.0.6), which introduced a new architecture that differs from v3:

1. **New `@theme` directive**: Tailwind v4 uses `@theme` instead of extending the config file
2. **Your project uses `src/styles.css`**: This is your main stylesheet (equivalent to what others call `globals.css`)
3. **Modern approach**: The v4 approach is more performant and streamlined

## Architecture

### 1. CSS Variables (`/src/styles.css`)

Your theme colors are defined using CSS custom properties in OKLCH color space:

```css
@layer base {
  :root {
    /* Light mode colors */
    --background: oklch(0.98 0 0);
    --foreground: oklch(0.145 0.0036 285.82);
    /* ... more colors */
  }

  .dark {
    /* Dark mode colors */
    --background: oklch(0.145 0.0036 285.82);
    --foreground: oklch(0.9686 0 0);
    /* ... more colors */
  }
}
```

### 2. Tailwind v4 Integration

The CSS variables are mapped to Tailwind utilities via the `@theme` directive:

```css
@theme {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  /* ... more mappings */
}
```

This allows you to use Tailwind classes like:
- `bg-background` - Uses the --background variable
- `text-foreground` - Uses the --foreground variable
- `border-border` - Uses the --border variable

### 3. Theme Utilities (`/src/lib/theme.ts`)

Core functions for theme management:
- `initializeTheme()` - Initializes theme on app load
- `getStoredTheme()` - Gets saved theme from localStorage
- `setStoredTheme()` - Saves theme to localStorage
- `getSystemTheme()` - Detects system preference
- `applyTheme()` - Applies dark/light class to DOM

### 4. React Hook (`/src/hooks/useTheme.ts`)

```typescript
const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();
```

Returns:
- `theme`: Current preference ('light' | 'dark' | 'system')
- `resolvedTheme`: Actual theme being displayed ('light' | 'dark')
- `setTheme`: Function to change theme preference
- `toggleTheme`: Quick toggle between light/dark

## Available Components

### 1. ThemeToggle (Simple Toggle Button)

**File**: `/src/components/ThemeToggle.tsx`

```tsx
import { ThemeToggle } from '@/components/ThemeToggle';

// Simple icon-only toggle
<ThemeToggle />

// With label
<ThemeToggle showLabel />

// Custom styling
<ThemeToggle className="ml-4" />
```

### 2. ThemeSelector (Dropdown Menu)

**File**: `/src/components/ThemeSelector.tsx`

```tsx
import { ThemeSelector } from '@/components/ThemeSelector';

// Full theme selector with light/dark/system options
<ThemeSelector />

// Custom styling
<ThemeSelector className="ml-auto" />
```

## Color Palette

### Light Mode
- **Background**: `oklch(0.98 0 0)` - Near white
- **Foreground**: `oklch(0.145 0.0036 285.82)` - Near black
- **Primary**: `oklch(0.2176 0.0108 285.75)` - Dark neutral
- **Card**: `oklch(1 0 0)` - Pure white

### Dark Mode
- **Background**: `oklch(0.145 0.0036 285.82)` - Near black
- **Foreground**: `oklch(0.9686 0 0)` - Near white
- **Primary**: `oklch(0.9686 0 0)` - Light neutral
- **Card**: Same as background for flat design

### Full Color System
- Background/Foreground
- Card/Card Foreground
- Popover/Popover Foreground
- Primary/Primary Foreground
- Secondary/Secondary Foreground
- Muted/Muted Foreground
- Accent/Accent Foreground
- Destructive/Destructive Foreground
- Border/Input/Ring
- Chart 1-5
- Sidebar (Background, Foreground, Primary, Accent, Border, Ring)

## Usage Examples

### 1. Using Theme Colors in Components

```tsx
// Using Tailwind utility classes
<div className="bg-background text-foreground">
  <button className="bg-primary text-primary-foreground">
    Click me
  </button>
</div>

// Cards
<div className="bg-card text-card-foreground border border-border">
  Card content
</div>

// Muted elements
<p className="text-muted-foreground">Secondary text</p>
```

### 2. Adding Theme Toggle to Header

```tsx
import { ThemeToggle } from '@/components/ThemeToggle';

export function Header() {
  return (
    <header className="flex items-center justify-between p-4">
      <h1>FlowSpace</h1>
      <ThemeToggle />
    </header>
  );
}
```

### 3. Creating a Settings Page

```tsx
import { ThemeSelector } from '@/components/ThemeSelector';
import { useTheme } from '@/hooks/useTheme';

export function Settings() {
  const { theme, resolvedTheme } = useTheme();

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-lg font-semibold mb-4">Appearance</h2>
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">
            Theme Preference
          </label>
          <ThemeSelector />
          <p className="text-xs text-muted-foreground">
            Currently using: {resolvedTheme} mode
          </p>
        </div>
      </div>
    </div>
  );
}
```

### 4. Programmatic Theme Control

```tsx
import { useTheme } from '@/hooks/useTheme';

export function CustomThemeControl() {
  const { setTheme } = useTheme();

  return (
    <div className="flex gap-2">
      <button onClick={() => setTheme('light')}>Light</button>
      <button onClick={() => setTheme('dark')}>Dark</button>
      <button onClick={() => setTheme('system')}>System</button>
    </div>
  );
}
```

## Advanced Customization

### Adding Custom Colors

1. Add to CSS variables in `src/styles.css`:

```css
:root {
  --success: oklch(0.7 0.15 145);
  --success-foreground: oklch(0.98 0 0);
}

.dark {
  --success: oklch(0.6 0.12 145);
  --success-foreground: oklch(0.1 0 0);
}
```

2. Map to Tailwind in `@theme`:

```css
@theme {
  --color-success: var(--success);
  --color-success-foreground: var(--success-foreground);
}
```

3. Use in components:

```tsx
<button className="bg-success text-success-foreground">
  Success!
</button>
```

### Modifying Existing Colors

Edit the OKLCH values in `src/styles.css` under both `:root` and `.dark` selectors.

OKLCH format: `oklch(lightness chroma hue)`
- Lightness: 0-1 (0 = black, 1 = white)
- Chroma: 0-0.4 (saturation)
- Hue: 0-360 (color angle)

## Benefits of OKLCH

1. **Perceptually uniform**: Equal numeric changes = equal visual changes
2. **Better gradients**: Smoother color transitions
3. **Wider color gamut**: Access to more vibrant colors
4. **Predictable lightness**: Easier to maintain contrast ratios

## Integration with shadcn

All shadcn components will automatically use your theme colors:
- Dialogs use `--popover` colors
- Buttons use `--primary` and `--secondary`
- Inputs use `--input` and `--ring` for focus states
- Destructive actions use `--destructive`

## Files Created/Modified

### Created
1. `/src/lib/theme.ts` - Theme utility functions
2. `/src/hooks/useTheme.ts` - React hook for theme management
3. `/src/components/ThemeToggle.tsx` - Simple toggle button
4. `/src/components/ThemeSelector.tsx` - Full selector dropdown

### Modified
1. `/src/styles.css` - Complete theme system with OKLCH colors
2. `/src/main.tsx` - Added theme initialization

## Next Steps

1. Add `<ThemeToggle />` to your header or navigation
2. Test theme switching across your components
3. Verify colors work well in both light and dark modes
4. Customize colors to match your brand
5. Add theme preference to user settings if you have authentication

## Troubleshooting

### Theme not persisting
- Check browser localStorage for 'flowspace-theme' key
- Ensure `initializeTheme()` is called in main.tsx

### Colors not updating
- Verify CSS variables are defined in both `:root` and `.dark`
- Check that components use Tailwind classes (not hardcoded colors)
- Clear browser cache and rebuild

### OKLCH not supported
- OKLCH is supported in modern browsers (Chrome 111+, Safari 16.4+)
- For older browsers, consider adding a fallback using PostCSS

## Resources

- [OKLCH Color Picker](https://oklch.com/)
- [TailwindCSS v4 Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Theming Guide](https://ui.shadcn.com/docs/theming)
