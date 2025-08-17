/**
 * Image Provider Utility for KIRA-Dahlia
 * Converts image filenames to proper CDN URLs
 */

export interface ImageOptions {
  width?: number;
  height?: number;
  fit?: 'cover' | 'contain' | 'fill' | 'outside' | 'inside';
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
}

/**
 * Convert image filename to CDN URL
 * @param filename - Image filename (e.g., "s28330054.jpg")
 * @param options - Image transformation options
 * @returns Full CDN URL
 */
export function getImageUrl(filename: string, options: ImageOptions = {}): string {
  if (!filename) return '';
  
  // Base CDN URL for MTLBooks thumbnails
  const baseUrl = 'https://cdn.mtlbooks.com/poster';
  
  // Clean filename (remove leading slash if present)
  const cleanFilename = filename.startsWith('/') ? filename.slice(1) : filename;
  
  // Construct base CDN URL
  let cdnUrl = `${baseUrl}/${cleanFilename}`;
  
  // If using wsrv.nl for image optimization
  if (options.width || options.height || options.fit || options.quality || options.format) {
    const wsrvBase = 'https://wsrv.nl';
    const params = new URLSearchParams();
    
    // Add source image
    params.set('url', cdnUrl);
    
    // Add transformation options
    if (options.width) params.set('w', options.width.toString());
    if (options.height) params.set('h', options.height.toString());
    if (options.fit) params.set('fit', options.fit);
    if (options.quality) params.set('q', options.quality.toString());
    if (options.format) params.set('f', options.format);
    
    // Add default optimizations
    params.set('output', 'webp');
    params.set('maxage', '3M');
    
    return `${wsrvBase}/?${params.toString()}`;
  }
  
  return cdnUrl;
}

/**
 * Get optimized thumbnail URL
 * @param filename - Image filename
 * @param size - Thumbnail size (width and height)
 * @returns Optimized thumbnail URL
 */
export function getThumbnailUrl(filename: string, size: number = 150): string {
  return getImageUrl(filename, {
    width: size,
    height: size,
    fit: 'cover',
    quality: 80,
    format: 'webp'
  });
}

/**
 * Get cover image URL for novels
 * @param filename - Cover image filename
 * @param size - Desired size (default: 200x300 for book covers)
 * @returns Optimized cover image URL
 */
export function getCoverUrl(filename: string, size: { width: number; height: number } = { width: 200, height: 300 }): string {
  return getImageUrl(filename, {
    width: size.width,
    height: size.height,
    fit: 'cover',
    quality: 85,
    format: 'webp'
  });
} 