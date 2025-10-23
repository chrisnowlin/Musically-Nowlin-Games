/**
 * Playful Theme Configuration
 * 
 * This file contains the design tokens and utilities for the playful theme
 * used throughout the Music Learning Games application. It ensures consistency
 * across the landing page and all game UIs.
 * 
 * Design Philosophy:
 * - Fun, whimsical, child-friendly interface
 * - Interactive hover effects and animations
 * - Bright colors and playful typography
 * - Character-driven design
 * - Emphasis on joy and discovery
 */

// ============================================================================
// COLOR PALETTE
// ============================================================================

export const playfulColors = {
  // Primary gradients
  gradients: {
    background: "bg-gradient-to-b from-yellow-100 via-pink-100 to-purple-100 dark:from-gray-900 dark:via-purple-900 dark:to-pink-900",
    backgroundAlt: "bg-gradient-to-br from-yellow-50 via-pink-50 to-purple-50 dark:from-gray-900 dark:via-purple-900 dark:to-pink-900",
    title: "bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent",
    buttonSuccess: "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600",
    buttonPrimary: "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600",
    buttonWarning: "bg-gradient-to-r from-orange-200 to-yellow-200 dark:from-orange-900 dark:to-yellow-900",
  },
  
  // Accent colors
  accents: {
    yellow: {
      light: "text-yellow-500",
      bg: "bg-yellow-300/30",
      border: "border-yellow-400",
    },
    pink: {
      light: "text-pink-500",
      bg: "bg-pink-300/30",
      border: "border-pink-400",
    },
    purple: {
      light: "text-purple-500",
      bg: "bg-purple-300/30",
      border: "border-purple-400",
      text: "text-purple-800 dark:text-purple-200",
      bgSolid: "bg-purple-100 dark:bg-purple-900",
    },
    green: {
      light: "text-green-500",
      bg: "bg-green-300/30",
      border: "border-green-400",
      hover: "hover:border-green-500",
    },
    orange: {
      light: "text-orange-600",
      text: "text-orange-800 dark:text-orange-200",
    },
    blue: {
      light: "text-blue-600",
    },
  },
  
  // Status colors
  status: {
    success: "text-green-600 dark:text-green-400",
    error: "text-red-600 dark:text-red-400",
    warning: "text-orange-600 dark:text-orange-400",
    info: "text-blue-600 dark:text-blue-400",
  },
} as const;

// ============================================================================
// TYPOGRAPHY
// ============================================================================

export const playfulTypography = {
  // Font families
  fonts: {
    heading: "font-fredoka",
    body: "font-nunito",
  },
  
  // Heading styles
  headings: {
    hero: "font-fredoka font-bold text-6xl md:text-8xl",
    h1: "font-fredoka font-bold text-4xl md:text-6xl",
    h2: "font-fredoka font-bold text-3xl md:text-4xl",
    h3: "font-fredoka font-bold text-2xl md:text-3xl",
    h4: "font-fredoka font-semibold text-xl md:text-2xl",
  },
  
  // Body text styles
  body: {
    large: "font-nunito text-lg md:text-xl",
    medium: "font-nunito text-base md:text-lg",
    small: "font-nunito text-sm md:text-base",
  },
} as const;

// ============================================================================
// BORDERS & SHAPES
// ============================================================================

export const playfulShapes = {
  // Border radius
  rounded: {
    card: "rounded-[2rem]",
    button: "rounded-full",
    badge: "rounded-full",
    container: "rounded-3xl",
    small: "rounded-xl",
  },
  
  // Border widths
  borders: {
    thick: "border-4",
    medium: "border-2",
    thin: "border",
  },
  
  // Shadows
  shadows: {
    card: "shadow-xl",
    button: "shadow-lg",
    subtle: "shadow-md",
  },
} as const;

// ============================================================================
// ANIMATIONS
// ============================================================================

export const playfulAnimations = {
  // Animation classes
  classes: {
    bounce: "animate-bounce",
    pulse: "animate-pulse",
    spin: "animate-spin",
  },
  
  // Hover effects
  hover: {
    scale: "hover:scale-105",
    scaleSmall: "hover:scale-102",
    rotate: "hover:-rotate-1",
    rotateAlt: "hover:rotate-1",
  },
  
  // Transition durations
  transitions: {
    fast: "transition-all duration-200",
    normal: "transition-all duration-300",
    slow: "transition-all duration-500",
  },
  
  // Animation delays (for staggered animations)
  delays: {
    delay75: "delay-75",
    delay150: "delay-150",
    delay300: "delay-300",
  },
} as const;

// ============================================================================
// DECORATIVE ELEMENTS
// ============================================================================

/**
 * Generates decorative floating orbs for backgrounds
 * These add visual interest and depth to the interface
 */
export const decorativeOrbs = [
  {
    position: "absolute top-10 left-10",
    size: "w-20 h-20",
    color: "bg-yellow-300/30",
    animation: "animate-pulse",
    blur: "blur-xl",
  },
  {
    position: "absolute top-40 right-20",
    size: "w-32 h-32",
    color: "bg-pink-300/30",
    animation: "animate-pulse delay-75",
    blur: "blur-xl",
  },
  {
    position: "absolute bottom-20 left-1/4",
    size: "w-24 h-24",
    color: "bg-purple-300/30",
    animation: "animate-pulse delay-150",
    blur: "blur-xl",
  },
] as const;

/**
 * Helper function to generate decorative orb elements
 */
export function generateDecorativeOrbs() {
  return decorativeOrbs.map((orb, index) => ({
    key: `orb-${index}`,
    className: `${orb.position} ${orb.size} ${orb.color} rounded-full ${orb.blur} ${orb.animation}`,
  }));
}

// ============================================================================
// COMPONENT STYLES
// ============================================================================

export const playfulComponents = {
  // Card styles
  card: {
    base: "bg-white dark:bg-gray-800 rounded-[2rem] shadow-xl transition-all duration-300 overflow-hidden border-4",
    available: "border-green-400 hover:border-green-500",
    disabled: "border-gray-300 opacity-75",
    hover: "hover:scale-105 hover:-rotate-1",
  },
  
  // Button styles
  button: {
    primary: "font-fredoka text-xl py-6 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg",
    secondary: "font-fredoka text-xl py-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg",
    disabled: "font-fredoka text-xl py-6 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400",
    success: "bg-green-500 hover:bg-green-500 text-white",
    error: "bg-red-500 hover:bg-red-500 text-white",
  },
  
  // Badge styles
  badge: {
    base: "inline-block px-3 py-1 rounded-full font-nunito text-sm font-semibold",
    purple: "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200",
    green: "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200",
    orange: "bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200",
  },
  
  // Icon container styles
  iconContainer: {
    large: "w-24 h-24 mx-auto rounded-full flex items-center justify-center shadow-lg",
    medium: "w-16 h-16 rounded-full flex items-center justify-center shadow-md",
    small: "w-12 h-12 rounded-full flex items-center justify-center shadow-sm",
  },
  
  // Question prompt styles
  questionPrompt: {
    container: "bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-lg border-4",
    higher: "text-blue-600 font-bold",
    lower: "text-orange-600 font-bold",
  },
} as const;

// ============================================================================
// SPACING & LAYOUT
// ============================================================================

export const playfulLayout = {
  // Container max widths
  containers: {
    narrow: "max-w-2xl",
    medium: "max-w-4xl",
    wide: "max-w-6xl",
    full: "max-w-7xl",
  },
  
  // Padding
  padding: {
    section: "py-8 px-4",
    card: "px-6 pb-6",
    button: "px-8 py-4",
  },
  
  // Gaps
  gaps: {
    small: "gap-2",
    medium: "gap-4",
    large: "gap-8",
  },
} as const;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Combines multiple class names, filtering out falsy values
 */
export function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

/**
 * Gets the appropriate game color class
 */
export function getGameColorClass(color: string) {
  return color;
}

/**
 * Gets animation delay class based on index
 */
export function getAnimationDelay(index: number) {
  return `style="animation-delay: ${index * 100}ms"`;
}

/**
 * Generates a complete card class string
 */
export function getCardClasses(isAvailable: boolean, isHovered: boolean) {
  return cn(
    playfulComponents.card.base,
    isAvailable ? playfulComponents.card.available : playfulComponents.card.disabled,
    isHovered && isAvailable ? playfulComponents.card.hover : ""
  );
}

/**
 * Generates a complete button class string
 */
export function getButtonClasses(variant: "primary" | "secondary" | "disabled" | "success" | "error") {
  return playfulComponents.button[variant];
}

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

const playfulTheme = {
  colors: playfulColors,
  typography: playfulTypography,
  shapes: playfulShapes,
  animations: playfulAnimations,
  components: playfulComponents,
  layout: playfulLayout,
  decorativeOrbs,
  generateDecorativeOrbs,
  cn,
  getGameColorClass,
  getAnimationDelay,
  getCardClasses,
  getButtonClasses,
};

export default playfulTheme;

