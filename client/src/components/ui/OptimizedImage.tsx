import { ImgHTMLAttributes } from "react";

interface OptimizedImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  /** Original image source path (e.g., "/images/photo.jpeg") */
  src: string;
  /** Alt text for accessibility */
  alt: string;
  /** Optional WebP source path - defaults to same path with .webp extension */
  webpSrc?: string;
  /** Loading strategy - defaults to lazy */
  loading?: 'lazy' | 'eager';
}

/**
 * OptimizedImage - Renders images with WebP support and fallback
 *
 * Uses the <picture> element to serve WebP to modern browsers
 * while falling back to the original format for older browsers.
 *
 * @example
 * <OptimizedImage
 *   src="/images/photo.jpeg"
 *   alt="A photo"
 *   className="w-full h-full object-cover"
 * />
 */
export function OptimizedImage({
  src,
  alt,
  webpSrc,
  loading = 'lazy',
  ...imgProps
}: OptimizedImageProps) {
  // Generate WebP path from original if not provided
  const webpPath = webpSrc || src.replace(/\.(png|jpe?g)$/i, '.webp');

  // Check if the source is already WebP
  const isAlreadyWebp = src.toLowerCase().endsWith('.webp');

  if (isAlreadyWebp) {
    // If already WebP, just render a simple img
    return (
      <img
        src={src}
        alt={alt}
        loading={loading}
        {...imgProps}
      />
    );
  }

  return (
    <picture>
      {/* WebP source for modern browsers */}
      <source srcSet={webpPath} type="image/webp" />
      {/* Fallback to original format */}
      <img
        src={src}
        alt={alt}
        loading={loading}
        {...imgProps}
      />
    </picture>
  );
}

export default OptimizedImage;
