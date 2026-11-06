import React, { useState } from 'react';
import {
  getImageVariantUrl,
  getImageSrcSet,
  getImageUrl,
  FALLBACK_IMAGE_DATA_URI,
} from '../utils/imageUrl';

/**
 * Reusable Optimized Image Component
 * - Supports responsive variants ('thumb', 'card', 'detail', 'original')
 * - Supports priority loading (eager + fetchPriority="high") for above-the-fold images
 * - Default lazy loading + async decoding for offscreen images
 * - Automatic 2-tier fallback: variant -> base URL -> festive SVG fallback
 * - Explicit aspect-ratio to prevent layout shifts
 */
export const OptimizedImage = ({
  src,
  alt = 'Product image',
  variant = 'card',
  priority = false,
  className = '',
  aspectRatio,
  sizes,
  useSrcSet = false,
  onError,
  ...props
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  if (!src || hasError) {
    return (
      <img
        src={FALLBACK_IMAGE_DATA_URI}
        alt={alt}
        className={className}
        style={aspectRatio ? { aspectRatio } : undefined}
        loading="lazy"
        decoding="async"
        {...props}
      />
    );
  }

  const primarySrc = getImageVariantUrl(src, variant);
  const srcSet = useSrcSet ? getImageSrcSet(src) : undefined;

  const handleImgError = (e) => {
    // If a variant (e.g. _card.webp) failed, try the base image URL first before falling back to placeholder
    const baseSrc = getImageUrl(src);
    if (e.target.src !== baseSrc) {
      e.target.src = baseSrc;
    } else {
      setHasError(true);
      if (onError) onError(e);
    }
  };

  return (
    <img
      src={primarySrc}
      srcSet={srcSet}
      sizes={sizes}
      alt={alt}
      className={`${className} ${!isLoaded && !priority ? 'opacity-90' : 'opacity-100'} transition-opacity duration-200`}
      style={aspectRatio ? { aspectRatio } : undefined}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'auto'}
      decoding={priority ? 'sync' : 'async'}
      onLoad={() => setIsLoaded(true)}
      onError={handleImgError}
      {...props}
    />
  );
};

export default OptimizedImage;
