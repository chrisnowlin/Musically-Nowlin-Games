const SIZE_CLASSES = {
  sm: 'h-16',
  md: 'h-20',
  lg: 'h-24',
} as const;

interface NotationImageProps {
  /** URL to the SVG notation image. */
  src: string;
  /** Accessible alt text. */
  alt: string;
  /** Display size: sm=h-16, md=h-20 (default), lg=h-24. */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS classes (e.g., margin). */
  className?: string;
}

/**
 * Displays a LilyPond-engraved SVG notation image with consistent
 * dark-theme styling (CSS invert filter) and error handling.
 */
export default function NotationImage({
  src,
  alt,
  size = 'md',
  className = '',
}: NotationImageProps) {
  return (
    <img
      src={src}
      alt={alt}
      className={`${SIZE_CLASSES[size]} mx-auto invert ${className}`.trim()}
      onError={(e) => {
        (e.target as HTMLImageElement).style.display = 'none';
      }}
    />
  );
}
