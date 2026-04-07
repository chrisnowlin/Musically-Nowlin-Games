/**
 * Image Utilities for WebP optimization
 */

/**
 * Generate a WebP path from an original image path
 */
export function getWebpPath(originalPath: string): string {
  return originalPath.replace(/\.(png|jpe?g)$/i, '.webp');
}

/**
 * Generate CSS background-image with WebP fallback using image-set()
 * Falls back to original format for browsers that don't support image-set
 *
 * @example
 * style={{ backgroundImage: getOptimizedBackgroundImage('/images/bg.jpeg') }}
 */
export function getOptimizedBackgroundImage(imagePath: string): string {
  const webpPath = getWebpPath(imagePath);

  // Use image-set with WebP as preferred format, original as fallback
  // Modern browsers will use WebP, older browsers fall back to the url()
  return `image-set(url('${webpPath}') type('image/webp'), url('${imagePath}') type('image/jpeg')), url('${imagePath}')`;
}

/**
 * Check if browser supports WebP
 * Note: This is async and should be used for dynamic checks
 */
export async function supportsWebP(): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  const webpData = 'data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA=';

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img.width > 0 && img.height > 0);
    img.onerror = () => resolve(false);
    img.src = webpData;
  });
}
