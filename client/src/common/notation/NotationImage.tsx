const SIZE_CLASSES = {
  sm: 'h-20',
  md: 'h-28',
  lg: 'h-32',
} as const;

interface NotationImageProps {
  /** URL to the SVG notation image. */
  src: string;
  /** Accessible alt text. */
  alt: string;
  /** Display size: sm=h-20, md=h-28 (default), lg=h-32. */
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
