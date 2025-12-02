# Responsive Layout Guide for Musically Nowlin Games

This guide explains how to make all games viewport-aware so that controls and buttons fit on a single screen without scrolling.

## Overview

The responsive layout system ensures that:
- All game content fits within the viewport without requiring scrolling
- UI elements scale appropriately based on screen size
- Touch targets meet accessibility requirements (minimum 44px)
- Games work seamlessly across devices (mobile, tablet, desktop)

## Core Components

### 1. ResponsiveGameLayout

The main wrapper component that ensures viewport-aware behavior.

**Location:** `client/src/components/ResponsiveGameLayout.tsx`

**Usage:**
```tsx
import { ResponsiveGameLayout } from '@/components/ResponsiveGameLayout';

export const MyGame = () => {
  return (
    <ResponsiveGameLayout showDecorations={true}>
      {/* Your game content here */}
    </ResponsiveGameLayout>
  );
};
```

**Features:**
- Automatic padding that scales with viewport
- Decorative background orbs that adapt to screen size
- Overflow detection and warnings (dev mode)
- Max-height constraint to prevent vertical scrolling

**Props:**
- `showDecorations?: boolean` - Show/hide decorative orbs (default: true)
- `className?: string` - Additional CSS classes
- `disableOverflowWarning?: boolean` - Disable overflow warnings (default: false)

### 2. GameSection

Section wrapper for header, main content, and footer areas.

**Usage:**
```tsx
import { GameSection } from '@/components/ResponsiveGameLayout';

// Header section
<GameSection variant="header">
  <ScoreDisplay />
</GameSection>

// Main game area (fills available space)
<GameSection variant="main" fillSpace>
  <GameContent />
</GameSection>

// Footer section
<GameSection variant="footer">
  <Instructions />
</GameSection>
```

**Props:**
- `variant?: 'header' | 'main' | 'footer'` - Section type (default: 'main')
- `fillSpace?: boolean` - Allow section to grow and fill space (default: false)
- `className?: string` - Additional CSS classes

### 3. ResponsiveGrid

Adaptive grid that adjusts columns based on viewport.

**Usage:**
```tsx
import { ResponsiveGrid } from '@/components/ResponsiveGameLayout';

// Fixed 2 columns
<ResponsiveGrid columns={2}>
  <GridItem />
  <GridItem />
</ResponsiveGrid>

// Auto-responsive columns (1 on mobile, 2 on tablet, 4 on desktop)
<ResponsiveGrid columns="auto">
  <GridItem />
  <GridItem />
  <GridItem />
  <GridItem />
</ResponsiveGrid>
```

**Props:**
- `columns?: 2 | 3 | 4 | 'auto'` - Number of columns (default: 'auto')
- `className?: string` - Additional CSS classes

**Auto column behavior:**
- Mobile (< 640px): 1 column
- Tablet (640-1024px): 2-3 columns
- Desktop (> 1024px): 4 columns

### 4. ResponsiveCard

Card component with viewport-aware padding and sizing.

**Usage:**
```tsx
import { ResponsiveCard } from '@/components/ResponsiveGameLayout';

<ResponsiveCard>
  <h2>Card Title</h2>
  <p>Card content</p>
</ResponsiveCard>
```

**Features:**
- Automatic padding that scales with viewport
- Rounded corners with clamp-based sizing
- Backdrop blur for glassmorphism effect

## Hooks

### useViewport

Tracks window dimensions and updates on resize.

**Usage:**
```tsx
import { useViewport } from '@/hooks/useViewport';

const MyComponent = () => {
  const { width, height } = useViewport();

  return <div>Viewport: {width}x{height}</div>;
};
```

**Returns:**
```ts
{
  width: number,  // Window inner width
  height: number  // Window inner height
}
```

### useDeviceType

Detects device type based on viewport width.

**Usage:**
```tsx
import { useDeviceType } from '@/hooks/useViewport';

const MyComponent = () => {
  const { isMobile, isTablet, isDesktop } = useDeviceType();

  return (
    <div>
      {isMobile && <MobileView />}
      {isTablet && <TabletView />}
      {isDesktop && <DesktopView />}
    </div>
  );
};
```

**Returns:**
```ts
{
  isMobile: boolean,       // < 768px
  isTablet: boolean,       // 768px - 1024px
  isDesktop: boolean,      // >= 1024px
  isSmallMobile: boolean,  // < 640px
  isLargeDesktop: boolean  // >= 1280px
}
```

### useResponsiveLayout

Comprehensive responsive layout calculations.

**Usage:**
```tsx
import { useResponsiveLayout } from '@/hooks/useViewport';

const MyComponent = () => {
  const layout = useResponsiveLayout();

  return (
    <div style={{ padding: `${layout.padding}px` }}>
      <h1 style={{ fontSize: `${layout.getFontSize('2xl')}px` }}>
        Title
      </h1>
    </div>
  );
};
```

**Returns:**
```ts
{
  viewport: { width, height },
  device: DeviceType,
  orientation: { isPortrait, isLandscape },
  padding: number,              // Safe padding based on viewport
  maxContentWidth: number,      // Max width that fits viewport
  gridGap: number,              // Optimal gap for grids
  availableHeight: number,      // Content height minus header/footer
  scale: (baseSize: number) => number,  // Scale values
  getFontSize: (size: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl') => number
}
```

### useOverflowDetection

Detects if content is overflowing its container.

**Usage:**
```tsx
import { useOverflowDetection } from '@/hooks/useViewport';
import { useRef } from 'react';

const MyComponent = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const hasOverflow = useOverflowDetection(containerRef);

  return (
    <div ref={containerRef}>
      {hasOverflow && <p>Content is overflowing!</p>}
      {/* Content */}
    </div>
  );
};
```

## CSS Utility Classes

### Viewport Utilities

```css
.viewport-container      /* Width: 100%, no horizontal overflow */
.safe-area-padding      /* Padding for mobile notches */
```

### Fluid Text Sizing

```css
.text-fluid-xs          /* clamp(0.75rem, 2vw, 0.875rem) */
.text-fluid-sm          /* clamp(0.875rem, 2.5vw, 1rem) */
.text-fluid-base        /* clamp(1rem, 3vw, 1.125rem) */
.text-fluid-lg          /* clamp(1.125rem, 3.5vw, 1.25rem) */
.text-fluid-xl          /* clamp(1.25rem, 4vw, 1.5rem) */
.text-fluid-2xl         /* clamp(1.5rem, 5vw, 2rem) */
.text-fluid-3xl         /* clamp(1.875rem, 6vw, 2.5rem) */
.text-fluid-4xl         /* clamp(2.25rem, 7vw, 3rem) */
```

### Fluid Spacing

```css
.space-fluid-xs         /* gap: clamp(0.5rem, 1vw, 0.75rem) */
.space-fluid-sm         /* gap: clamp(0.75rem, 2vw, 1rem) */
.space-fluid-base       /* gap: clamp(1rem, 3vw, 1.5rem) */
.space-fluid-lg         /* gap: clamp(1.5rem, 4vw, 2rem) */
.space-fluid-xl         /* gap: clamp(2rem, 5vw, 3rem) */
```

### Game-Specific Utilities

```css
.game-container         /* Full viewport height, no overflow */
.game-section-scrollable /* Scrollable section with touch support */
.touch-target           /* Minimum 44px touch target */
.aspect-game-card       /* 3:4 aspect ratio */
.aspect-game-button     /* 16:9 aspect ratio */
.no-select-gameplay     /* Prevent text selection */
.no-bounce              /* Prevent scroll bounce on mobile */
```

## Breakpoints

```ts
const BREAKPOINTS = {
  xs: 320,   // Small mobile
  sm: 640,   // Mobile
  md: 768,   // Tablet portrait
  lg: 1024,  // Desktop / Tablet landscape
  xl: 1280,  // Large desktop
  '2xl': 1536 // Ultra-wide
};
```

## Migration Guide for Existing Games

### Step 1: Wrap Game in ResponsiveGameLayout

**Before:**
```tsx
export const MyGame = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-100 to-purple-100">
      {/* Game content */}
    </div>
  );
};
```

**After:**
```tsx
import { ResponsiveGameLayout } from '@/components/ResponsiveGameLayout';

export const MyGame = () => {
  return (
    <ResponsiveGameLayout>
      {/* Game content */}
    </ResponsiveGameLayout>
  );
};
```

### Step 2: Use GameSection for Layout Structure

**Before:**
```tsx
<header className="py-4 md:py-8">
  <ScoreDisplay />
</header>
<main className="flex-1">
  <GameContent />
</main>
<footer className="py-4">
  <Instructions />
</footer>
```

**After:**
```tsx
<GameSection variant="header">
  <ScoreDisplay />
</GameSection>
<GameSection variant="main" fillSpace>
  <GameContent />
</GameSection>
<GameSection variant="footer">
  <Instructions />
</GameSection>
```

### Step 3: Replace Fixed Sizes with Responsive Values

**Before:**
```tsx
<h1 className="text-4xl md:text-6xl">Title</h1>
<div className="p-4 md:p-8">Content</div>
<div className="grid grid-cols-2 gap-4">
  {/* Grid items */}
</div>
```

**After:**
```tsx
import { useResponsiveLayout } from '@/hooks/useViewport';

const layout = useResponsiveLayout();

<h1 style={{ fontSize: `${layout.getFontSize('4xl')}px` }}>Title</h1>
<div style={{ padding: `${layout.padding}px` }}>Content</div>
<ResponsiveGrid columns={2}>
  {/* Grid items */}
</ResponsiveGrid>
```

### Step 4: Handle Device-Specific Content

**Before:**
```tsx
<Music2 className="w-24 h-24" />
```

**After:**
```tsx
import { useResponsiveLayout } from '@/hooks/useViewport';

const layout = useResponsiveLayout();

<Music2 className={`${layout.device.isMobile ? 'w-16 h-16' : 'w-24 h-24'}`} />
```

## Best Practices

### 1. Always Use ResponsiveGameLayout

Wrap every game component in `ResponsiveGameLayout` to ensure consistent responsive behavior.

### 2. Avoid Fixed Pixel Values

Instead of `p-4`, `text-xl`, or fixed pixel values, use:
- `layout.padding` for padding
- `layout.getFontSize()` for font sizes
- `layout.gridGap` for grid gaps

### 3. Use GameSection for Structure

Divide your game into three sections:
- Header (score, title, controls)
- Main (game content - use `fillSpace` prop)
- Footer (instructions, tips)

### 4. Respect Touch Target Sizes

Buttons and interactive elements should be at least 44px × 44px:

```tsx
<Button
  className="touch-target"
  style={{
    minWidth: '44px',
    minHeight: '44px',
    padding: `${layout.padding}px`
  }}
>
  Click
</Button>
```

### 5. Test on Multiple Viewport Sizes

Test your game at these critical breakpoints:
- 320px (iPhone SE)
- 375px (iPhone 12/13)
- 768px (iPad portrait)
- 1024px (iPad landscape / small desktop)
- 1920px (Full HD desktop)

### 6. Use ResponsiveGrid for Game Boards

For grids of buttons, cards, or characters:

```tsx
<ResponsiveGrid columns={4}>
  {items.map(item => <GridItem key={item.id} />)}
</ResponsiveGrid>
```

### 7. Handle Overflow Gracefully

If content must scroll, use the scrollable game section:

```tsx
<GameSection variant="main" fillSpace>
  <div className="game-section-scrollable">
    {/* Scrollable content */}
  </div>
</GameSection>
```

### 8. Scale Icons and Images

Use device-specific sizing for visual elements:

```tsx
const iconSize = layout.device.isMobile ? 20 : 24;
<Icon className={`w-${iconSize} h-${iconSize}`} />
```

### 9. Avoid Absolute Positioning for Content

Absolute positioning breaks responsive layouts. Use flexbox or grid instead.

**Bad:**
```tsx
<div className="absolute top-10 left-10">Content</div>
```

**Good:**
```tsx
<div className="flex justify-start items-start p-4">Content</div>
```

### 10. Test with DevTools Device Emulation

Use browser DevTools to emulate various devices:
1. Open DevTools (F12)
2. Click device toolbar icon (Ctrl+Shift+M)
3. Test different device presets
4. Rotate between portrait and landscape

## Common Issues and Solutions

### Issue 1: Content Overflows Vertically

**Problem:** Game content is taller than viewport, requiring scroll.

**Solution:** Use `fillSpace` prop on main section and limit content height:

```tsx
<GameSection variant="main" fillSpace>
  <div className="h-full overflow-y-auto">
    {/* Content that may overflow */}
  </div>
</GameSection>
```

### Issue 2: Text Too Small on Mobile

**Problem:** Text is hard to read on small screens.

**Solution:** Use `layout.getFontSize()` with appropriate base sizes:

```tsx
const layout = useResponsiveLayout();

<p style={{ fontSize: `${layout.getFontSize('base')}px` }}>
  This text scales appropriately
</p>
```

### Issue 3: Buttons Too Small to Tap

**Problem:** Touch targets are smaller than 44px.

**Solution:** Add minimum dimensions:

```tsx
<Button
  style={{
    minWidth: '44px',
    minHeight: '44px',
    padding: `${layout.padding}px`
  }}
>
  Tap
</Button>
```

### Issue 4: Grid Items Overflow Horizontally

**Problem:** Grid has too many columns for viewport width.

**Solution:** Use ResponsiveGrid with auto columns:

```tsx
<ResponsiveGrid columns="auto">
  {/* Items automatically adjust column count */}
</ResponsiveGrid>
```

### Issue 5: Fixed Width Containers

**Problem:** `max-w-5xl` causes horizontal scroll on small screens.

**Solution:** Use `layout.maxContentWidth`:

```tsx
<div style={{ maxWidth: `${layout.maxContentWidth}px` }}>
  Content fits viewport
</div>
```

## Example: Complete Game Component

```tsx
import { useState } from 'react';
import { ResponsiveGameLayout, GameSection, ResponsiveGrid } from '@/components/ResponsiveGameLayout';
import { useResponsiveLayout } from '@/hooks/useViewport';
import { Button } from '@/components/ui/button';

export const MyGame = () => {
  const layout = useResponsiveLayout();
  const [score, setScore] = useState(0);

  return (
    <ResponsiveGameLayout showDecorations={true}>
      {/* Header */}
      <GameSection variant="header">
        <div className="text-center">
          <h1
            className="font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
            style={{ fontSize: `${layout.getFontSize('4xl')}px` }}
          >
            My Awesome Game
          </h1>
          <p style={{ fontSize: `${layout.getFontSize('lg')}px` }}>
            Score: {score}
          </p>
        </div>
      </GameSection>

      {/* Main game area */}
      <GameSection variant="main" fillSpace>
        <div className="flex flex-col items-center justify-center h-full">
          {/* Question */}
          <div
            className="bg-white/80 rounded-3xl shadow-xl"
            style={{
              padding: `${layout.padding}px`,
              maxWidth: `${layout.maxContentWidth}px`,
              marginBottom: `${layout.padding}px`
            }}
          >
            <h2 style={{ fontSize: `${layout.getFontSize('2xl')}px` }}>
              What's the answer?
            </h2>
          </div>

          {/* Game board */}
          <ResponsiveGrid columns={2}>
            <Button
              className="touch-target"
              style={{
                padding: `${layout.padding}px`,
                fontSize: `${layout.getFontSize('lg')}px`
              }}
            >
              Option A
            </Button>
            <Button
              className="touch-target"
              style={{
                padding: `${layout.padding}px`,
                fontSize: `${layout.getFontSize('lg')}px`
              }}
            >
              Option B
            </Button>
          </ResponsiveGrid>
        </div>
      </GameSection>

      {/* Footer */}
      <GameSection variant="footer">
        <div
          className="text-center bg-white/80 rounded-3xl shadow-lg"
          style={{
            padding: `${layout.padding * 0.75}px`,
            maxWidth: `${layout.maxContentWidth}px`,
            margin: '0 auto'
          }}
        >
          <p style={{ fontSize: `${layout.getFontSize('sm')}px` }}>
            🎵 Choose the correct answer! 🎵
          </p>
        </div>
      </GameSection>
    </ResponsiveGameLayout>
  );
};
```

## Testing Checklist

Before committing a game, verify:

- [ ] Game wrapped in `ResponsiveGameLayout`
- [ ] Uses `GameSection` for header/main/footer
- [ ] No fixed pixel widths (use `layout.maxContentWidth`)
- [ ] Font sizes use `layout.getFontSize()`
- [ ] Padding uses `layout.padding`
- [ ] Buttons meet 44px touch target minimum
- [ ] Tested at 320px width (smallest mobile)
- [ ] Tested at 768px width (tablet)
- [ ] Tested at 1920px width (desktop)
- [ ] No horizontal scrolling at any breakpoint
- [ ] No vertical scrolling (or intentional with scrollable section)
- [ ] Icons scale appropriately with device size

## Resources

- **Example Implementation:** `client/src/components/Game.tsx`
- **Hooks:** `client/src/hooks/useViewport.ts`
- **Components:** `client/src/components/ResponsiveGameLayout.tsx`
- **CSS Utilities:** `client/src/index.css` (lines 325-402)

## Support

For questions or issues with responsive layouts, check:
1. This guide
2. Example games using the system
3. Browser DevTools for debugging
4. Console warnings (overflow detection in dev mode)
