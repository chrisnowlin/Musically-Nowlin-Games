const SIZE_CLASSES = {
  sm: 'max-h-40',
  md: 'max-h-56',
  lg: 'max-h-64',
} as const;

interface NotationImageProps {
  /** URL to the SVG notation image. */
  src: string;
  /** Accessible alt text. */
  alt: string;
  /** Display size: sm=max-h-40, md=max-h-56 (default), lg=max-h-64. */
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
