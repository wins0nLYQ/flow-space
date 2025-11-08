# Theme System Quick Start

## TL;DR - Get Started in 30 Seconds

### 1. Add Theme Toggle to Your App

```tsx
import { ThemeToggle } from './components/ThemeToggle';

// In your Header, Toolbar, or Navigation component
<ThemeToggle />
```

### 2. Use Theme Colors in Components

```tsx
// Background/Foreground
<div className="bg-background text-foreground">

// Primary button
<button className="bg-primary text-primary-foreground">

// Secondary button
<button className="bg-secondary text-secondary-foreground">

// Muted text
<p className="text-muted-foreground">

// Cards
<div className="bg-card text-card-foreground border border-border">

// Destructive action
<button className="bg-destructive text-destructive-foreground">
```

### 3. Programmatic Control

```tsx
import { useTheme } from './hooks/useTheme';

function MyComponent() {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();

  return (
    <div>
      <p>Current theme: {theme}</p>
      <p>Showing: {resolvedTheme}</p>
      <button onClick={toggleTheme}>Toggle</button>
      <button onClick={() => setTheme('dark')}>Dark Mode</button>
    </div>
  );
}
```

## Why No `globals.css`?

You're using **TailwindCSS v4**, which has a new architecture:
- Uses `@theme` directive instead of config file
- Your styles are in `/src/styles.css` (this IS your globals file)
- More performant and modern approach

## What Was Set Up

1. **Complete color system** with OKLCH values in `/src/styles.css`
2. **Light & dark modes** with automatic system detection
3. **Theme utilities** in `/src/lib/theme.ts`
4. **React hook** in `/src/hooks/useTheme.ts`
5. **Pre-built components**:
   - `ThemeToggle` - Simple toggle button
   - `ThemeSelector` - Full dropdown menu

## Available Colors

Use these Tailwind classes directly:

- `bg-background` / `text-foreground`
- `bg-card` / `text-card-foreground`
- `bg-primary` / `text-primary-foreground`
- `bg-secondary` / `text-secondary-foreground`
- `bg-muted` / `text-muted-foreground`
- `bg-accent` / `text-accent-foreground`
- `bg-destructive` / `text-destructive-foreground`
- `border-border`
- `ring-ring`

All colors automatically adapt to light/dark mode!

## File Locations

- **Main styles**: `/src/styles.css`
- **Theme utilities**: `/src/lib/theme.ts`
- **React hook**: `/src/hooks/useTheme.ts`
- **Toggle component**: `/src/components/ThemeToggle.tsx`
- **Selector component**: `/src/components/ThemeSelector.tsx`
- **Full docs**: `/THEME_SETUP.md`

## Common Tasks

### Change Default Theme
Edit the colors in `/src/styles.css` under `:root` (light) and `.dark` (dark).

### Add Custom Color
```css
/* In src/styles.css */
:root {
  --my-color: oklch(0.7 0.15 120);
}

/* In @theme section */
@theme {
  --color-my-color: var(--my-color);
}

/* Use in component */
<div className="bg-my-color">
```

### Test Theme Switching
```bash
npm run dev
```
Then click the theme toggle or open browser console:
```js
localStorage.setItem('flowspace-theme', 'dark')
location.reload()
```

That's it! For detailed information, see `THEME_SETUP.md`.
