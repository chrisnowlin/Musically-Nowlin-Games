const SIZE_CLASSES = {
  sm: 'w-3/5',
  md: 'w-4/5',
  lg: 'w-full',
} as const;

interface NotationImageProps {
  /** URL to the SVG notation image. */
  src: string;
  /** Accessible alt text. */
  alt: string;
  /** Display size: sm=w-3/5, md=w-4/5 (default), lg=w-full. */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS classes (e.g., margin). */
  className?: string;
}

/**
 * Displays a LilyPond-engraved SVG notation image with consistent
 * dark-theme styling (CSS invert filter) and error handling.
 *
 * Uses a wrapper div for width sizing because LilyPond SVGs have fixed
 * intrinsic dimensions (e.g. width="37mm"). The inner img uses w-full
 * to scale to fill the wrapper.
 */
export default function NotationImage({
  src,
  alt,
  size = 'md',
  className = '',
}: NotationImageProps) {
  return (
    <div className={`${SIZE_CLASSES[size]} mx-auto ${className}`.trim()}>
      <img
        src={src}
        alt={alt}
        className="w-full h-auto invert"
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = 'none';
        }}
      />
    </div>
  );
}
