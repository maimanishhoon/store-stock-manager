/**
 * Resolves a product or upload image URL.
 * If the image path is relative (e.g. /uploads/image.webp), it prefixes the backend VITE_API_URL.
 * If the image is already an absolute URL (e.g. Unsplash, Cloudinary, AWS S3), it returns it as-is.
 */
export const getImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  const apiBase = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  return apiBase ? `${apiBase}${cleanPath}` : cleanPath;
};

/**
 * Returns an optimized variant URL for a given image.
 * Supported variants:
 * - 'thumb'  (~150x150) -> for table rows, small previews, cart items
 * - 'card'   (~400x400) -> for store catalog cards, admin product cards
 * - 'detail' (~900x900) -> for modal previews, product detail views
 * - 'original'          -> the full-res image
 */
export const getImageVariantUrl = (url, variant = 'card') => {
  if (!url) return '';

  // 1. Unsplash dynamic resizing parameters
  if (url.includes('images.unsplash.com')) {
    try {
      const parsed = new URL(url);
      const width = variant === 'thumb' ? 150 : variant === 'card' ? 400 : variant === 'detail' ? 900 : 1600;
      parsed.searchParams.set('w', width.toString());
      parsed.searchParams.set('auto', 'format');
      parsed.searchParams.set('q', '75');
      return parsed.toString();
    } catch {
      return url;
    }
  }

  // 2. Absolute non-relative external URLs or data URIs
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }

  // 3. Local /uploads/ images
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  if (variant && variant !== 'original' && cleanPath.startsWith('/uploads/')) {
    const dotIndex = cleanPath.lastIndexOf('.');
    if (dotIndex > 0) {
      const basePath = cleanPath.substring(0, dotIndex);
      // Avoid duplicate suffixing if already suffixed
      if (!basePath.endsWith('_thumb') && !basePath.endsWith('_card') && !basePath.endsWith('_detail')) {
        const variantPath = `${basePath}_${variant}.webp`;
        return getImageUrl(variantPath);
      }
    }
  }

  return getImageUrl(cleanPath);
};

/**
 * Generates responsive srcSet for an image
 */
export const getImageSrcSet = (url) => {
  if (!url || url.startsWith('data:')) return undefined;
  const thumb = getImageVariantUrl(url, 'thumb');
  const card = getImageVariantUrl(url, 'card');
  const detail = getImageVariantUrl(url, 'detail');
  return `${thumb} 150w, ${card} 400w, ${detail} 900w`;
};

/**
 * High-quality festive SVG fallback data URI to prevent broken image icons
 */
export const FALLBACK_IMAGE_DATA_URI =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300' width='400' height='300'%3E%3Crect width='400' height='300' fill='%23fffbeb'/%3E%3Ccircle cx='200' cy='140' r='50' fill='%23fef3c7'/%3E%3Cpath d='M200 110c-15 25-5 45 0 50 5-5 15-25 0-50z' fill='%23f59e0b'/%3E%3Cpath d='M175 160c0 15 50 15 50 0z' fill='%23d97706'/%3E%3Ctext x='200' y='210' font-family='sans-serif' font-size='13' font-weight='600' fill='%2392400e' text-anchor='middle'%3EDiwali Express%3C/text%3E%3C/svg%3E";
