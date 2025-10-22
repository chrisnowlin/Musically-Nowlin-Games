import React, { useRef, useEffect } from 'react';
import { useResponsiveLayout, useOverflowDetection } from '@/hooks/useViewport';
import playfulTheme from '@/theme/playful';

interface ResponsiveGameLayoutProps {
  children: React.ReactNode;
  /** Show decorative background orbs (default: true) */
  showDecorations?: boolean;
  /** Additional className for customization */
  className?: string;
  /** Disable overflow warnings (default: false) */
  disableOverflowWarning?: boolean;
}

/**
 * ResponsiveGameLayout - Viewport-aware container for all games
 *
 * Features:
 * - Ensures content fits within viewport without scrolling
 * - Responsive padding that scales with screen size
 * - Safe area handling for mobile devices
 * - Overflow detection and warnings
 * - Decorative background elements that adapt to screen size
 *
 * Usage:
 * ```tsx
 * <ResponsiveGameLayout>
 *   <YourGameContent />
 * </ResponsiveGameLayout>
 * ```
 */
export const ResponsiveGameLayout: React.FC<ResponsiveGameLayoutProps> = ({
  children,
  showDecorations = true,
  className = '',
  disableOverflowWarning = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const layout = useResponsiveLayout();
  const hasOverflow = useOverflowDetection(containerRef);

  // Warn in development if overflow detected
  useEffect(() => {
    if (hasOverflow && !disableOverflowWarning && import.meta.env.DEV) {
      console.warn(
        '[ResponsiveGameLayout] Content overflow detected. Consider adjusting layout for current viewport:',
        { viewport: layout.viewport, device: layout.device }
      );
    }
  }, [hasOverflow, disableOverflowWarning, layout]);

  // Generate responsive decorative orbs
  const decorativeOrbs = showDecorations && !layout.device.isSmallMobile ? [
    {
      key: 'orb-1',
      className: `absolute top-[5%] left-[5%] ${layout.device.isMobile ? 'w-16 h-16' : 'w-32 h-32'} bg-purple-200/30 rounded-full blur-2xl animate-pulse`,
      style: { animationDelay: '0s', animationDuration: '4s' },
    },
    {
      key: 'orb-2',
      className: `absolute top-[10%] right-[8%] ${layout.device.isMobile ? 'w-20 h-20' : 'w-40 h-40'} bg-pink-200/30 rounded-full blur-2xl animate-pulse`,
      style: { animationDelay: '1s', animationDuration: '5s' },
    },
    {
      key: 'orb-3',
      className: `absolute bottom-[15%] left-[10%] ${layout.device.isMobile ? 'w-24 h-24' : 'w-48 h-48'} bg-yellow-200/30 rounded-full blur-2xl animate-pulse`,
      style: { animationDelay: '2s', animationDuration: '6s' },
    },
    {
      key: 'orb-4',
      className: `absolute bottom-[20%] right-[5%] ${layout.device.isMobile ? 'w-28 h-28' : 'w-56 h-56'} bg-blue-200/30 rounded-full blur-2xl animate-pulse`,
      style: { animationDelay: '0.5s', animationDuration: '5.5s' },
    },
  ] : [];

  return (
    <div
      ref={containerRef}
      className={`
        relative
        min-h-screen
        max-h-screen
        overflow-hidden
        ${playfulTheme.gradients.background}
        ${className}
      `}
      style={{
        padding: `${layout.padding}px`,
      }}
    >
      {/* Decorative background orbs - responsive sizes */}
      {decorativeOrbs.map((orb) => (
        <div
          key={orb.key}
          className={orb.className}
          style={orb.style}
          aria-hidden="true"
        />
      ))}

      {/* Main content container - fits viewport without scrolling */}
      <div
        className="
          relative
          z-10
          w-full
          h-full
          max-h-[calc(100vh-var(--safe-padding))]
          flex
          flex-col
        "
        style={{
          '--safe-padding': `${layout.padding * 2}px`,
        } as React.CSSProperties}
      >
        {children}
      </div>

      {/* Overflow warning indicator (dev only) */}
      {hasOverflow && !disableOverflowWarning && import.meta.env.DEV && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm z-50">
          ⚠️ Content overflow detected
        </div>
      )}
    </div>
  );
};

/**
 * GameSection - Responsive section wrapper for game content areas
 *
 * Usage:
 * ```tsx
 * <GameSection variant="header">
 *   <ScoreDisplay />
 * </GameSection>
 * <GameSection variant="main" fillSpace>
 *   <GameContent />
 * </GameSection>
 * <GameSection variant="footer">
 *   <Instructions />
 * </GameSection>
 * ```
 */
interface GameSectionProps {
  children: React.ReactNode;
  /** Section type affects spacing and sizing */
  variant?: 'header' | 'main' | 'footer';
  /** Allow section to grow and fill available space */
  fillSpace?: boolean;
  /** Additional className */
  className?: string;
}

export const GameSection: React.FC<GameSectionProps> = ({
  children,
  variant = 'main',
  fillSpace = false,
  className = '',
}) => {
  const layout = useResponsiveLayout();

  const variantStyles = {
    header: 'flex-shrink-0',
    main: fillSpace ? 'flex-1 overflow-auto' : 'flex-shrink-0',
    footer: 'flex-shrink-0',
  };

  const spacing = {
    header: layout.device.isMobile ? 'mb-3' : 'mb-4',
    main: layout.device.isMobile ? 'my-3' : 'my-4',
    footer: layout.device.isMobile ? 'mt-3' : 'mt-4',
  };

  return (
    <div
      className={`
        ${variantStyles[variant]}
        ${spacing[variant]}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

/**
 * ResponsiveGrid - Adaptive grid that adjusts columns based on viewport
 *
 * Usage:
 * ```tsx
 * <ResponsiveGrid columns="auto">
 *   <GridItem />
 *   <GridItem />
 * </ResponsiveGrid>
 * ```
 */
interface ResponsiveGridProps {
  children: React.ReactNode;
  /** Number of columns or 'auto' for responsive behavior */
  columns?: 2 | 3 | 4 | 'auto';
  /** Additional className */
  className?: string;
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  columns = 'auto',
  className = '',
}) => {
  const layout = useResponsiveLayout();

  // Auto column calculation based on viewport
  const getGridColumns = () => {
    if (columns === 'auto') {
      if (layout.device.isSmallMobile) return 1;
      if (layout.device.isMobile) return 2;
      if (layout.device.isTablet) return 3;
      return 4;
    }
    return columns;
  };

  const gridCols = getGridColumns();

  return (
    <div
      className={`
        grid
        ${className}
      `}
      style={{
        gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
        gap: `${layout.gridGap}px`,
      }}
    >
      {children}
    </div>
  );
};

/**
 * ResponsiveCard - Card component with viewport-aware padding and sizing
 */
interface ResponsiveCardProps {
  children: React.ReactNode;
  className?: string;
}

export const ResponsiveCard: React.FC<ResponsiveCardProps> = ({
  children,
  className = '',
}) => {
  const layout = useResponsiveLayout();

  return (
    <div
      className={`
        bg-white/80
        dark:bg-gray-800/80
        backdrop-blur-sm
        rounded-[clamp(1rem,2vw,2rem)]
        shadow-xl
        ${className}
      `}
      style={{
        padding: `${Math.max(layout.padding * 0.5, 12)}px`,
      }}
    >
      {children}
    </div>
  );
};
