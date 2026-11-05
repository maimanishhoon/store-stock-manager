/**
 * Resolves a product or upload image URL.
 * If the image path is relative (e.g. /uploads/image.png), it prefixes the backend VITE_API_URL.
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
