import { useState, useEffect } from 'react';

/**
 * Viewport size hook - tracks window dimensions and updates on resize
 */
export const useViewport = () => {
  const [viewport, setViewport] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    const handleResize = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    // Throttle resize events for better performance
    let timeoutId: NodeJS.Timeout;
    const throttledResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleResize, 100);
    };

    window.addEventListener('resize', throttledResize);

    // Initial call to set correct dimensions
    handleResize();

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', throttledResize);
    };
  }, []);

  return viewport;
};

/**
 * Breakpoint constants matching Tailwind defaults + custom xs
 */
export const BREAKPOINTS = {
  xs: 320,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

/**
 * Device type detection based on viewport width
 */
export const useDeviceType = () => {
  const { width } = useViewport();

  return {
    isMobile: width < BREAKPOINTS.md,
    isTablet: width >= BREAKPOINTS.md && width < BREAKPOINTS.lg,
    isDesktop: width >= BREAKPOINTS.lg,
    isSmallMobile: width < BREAKPOINTS.sm,
    isLargeDesktop: width >= BREAKPOINTS.xl,
  };
};

/**
 * Responsive layout calculations for games
 * Returns optimal dimensions and spacing based on viewport
 */
export const useResponsiveLayout = () => {
  const { width, height } = useViewport();
  const device = useDeviceType();

  // Calculate safe padding that scales with viewport
  const getSafePadding = () => {
    if (width < BREAKPOINTS.xs) return 8; // Very small devices
    if (width < BREAKPOINTS.sm) return 12; // Small mobile
    if (width < BREAKPOINTS.md) return 16; // Mobile
    if (width < BREAKPOINTS.lg) return 24; // Tablet
    return 32; // Desktop
  };

  // Calculate max content width that fits viewport
  const getMaxContentWidth = () => {
    const padding = getSafePadding() * 2;
    return Math.min(width - padding, 1536); // Max 2xl breakpoint
  };

  // Calculate optimal gap size for grids
  const getGridGap = () => {
    if (width < BREAKPOINTS.sm) return 8; // 0.5rem
    if (width < BREAKPOINTS.md) return 12; // 0.75rem
    if (width < BREAKPOINTS.lg) return 16; // 1rem
    if (width < BREAKPOINTS.xl) return 24; // 1.5rem
    return 32; // 2rem
  };

  // Calculate if viewport is in portrait or landscape
  const isPortrait = height > width;
  const isLandscape = width > height;

  // Calculate available content height (minus typical header/footer)
  const getAvailableHeight = () => {
    const headerHeight = device.isMobile ? 60 : 80;
    const footerHeight = device.isMobile ? 40 : 60;
    return height - headerHeight - footerHeight;
  };

  return {
    viewport: { width, height },
    device,
    orientation: { isPortrait, isLandscape },
    padding: getSafePadding(),
    maxContentWidth: getMaxContentWidth(),
    gridGap: getGridGap(),
    availableHeight: getAvailableHeight(),

    // Utility functions
    scale: (baseSize: number) => {
      // Scale values based on viewport width (relative to 1024px baseline)
      const scaleFactor = width / 1024;
      return Math.max(baseSize * 0.7, Math.min(baseSize * scaleFactor, baseSize * 1.3));
    },

    // Font size calculator
    getFontSize: (base: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl') => {
      const baseSizes = {
        xs: 12,
        sm: 14,
        base: 16,
        lg: 18,
        xl: 20,
        '2xl': 24,
        '3xl': 30,
        '4xl': 36,
      };

      const baseSize = baseSizes[base];

      if (width < BREAKPOINTS.sm) return baseSize * 0.85;
      if (width < BREAKPOINTS.md) return baseSize * 0.9;
      if (width < BREAKPOINTS.lg) return baseSize;
      return baseSize * 1.1;
    },
  };
};

/**
 * Hook to detect if content needs scrolling
 * Useful for warning users or adjusting layout
 */
export const useOverflowDetection = (ref: React.RefObject<HTMLElement>) => {
  const [hasOverflow, setHasOverflow] = useState(false);

  useEffect(() => {
    const checkOverflow = () => {
      if (ref.current) {
        const hasVerticalOverflow = ref.current.scrollHeight > ref.current.clientHeight;
        const hasHorizontalOverflow = ref.current.scrollWidth > ref.current.clientWidth;
        setHasOverflow(hasVerticalOverflow || hasHorizontalOverflow);
      }
    };

    checkOverflow();

    // Check on resize
    const resizeObserver = new ResizeObserver(checkOverflow);
    if (ref.current) {
      resizeObserver.observe(ref.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [ref]);

  return hasOverflow;
};
