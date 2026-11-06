import React, { useState, useEffect } from 'react';
import {
  getImageVariantUrl,
  getImageSrcSet,
  getImageUrl,
  FALLBACK_IMAGE_DATA_URI,
} from '../utils/imageUrl';

/**
 * Reusable Optimized Image Component
 * - 3-stage resilient fallback:
 *     Stage 0: Optimized variant URL (e.g. _card.webp) with responsive srcSet (if enabled)
 *     Stage 1: Base original URL (without srcSet)
 *     Stage 2: Festive SVG placeholder (FALLBACK_IMAGE_DATA_URI)
 * - Safe state-driven retry, preventing DOM mutations and infinite error loops
 * - Auto-resets when src or variant prop changes
 * - Explicit aspectRatio to eliminate layout shifts (CLS)
 * - Native lazy loading and async decoding
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
  // stage: 0 = variant, 1 = original base url, 2 = fallback placeholder
  const [stage, setStage] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  // Reset stage and loaded state whenever source or variant changes
  useEffect(() => {
    setStage(0);
    setIsLoaded(false);
  }, [src, variant]);

  if (!src || stage >= 2) {
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

  const variantUrl = getImageVariantUrl(src, variant);
  const baseOriginalUrl = getImageUrl(src);

  // If stage is 0, use variantUrl. If stage is 1, use base original URL.
  const currentSrc = stage === 0 ? variantUrl : baseOriginalUrl;
  // Only use srcSet on stage 0 to prevent browser from re-requesting failed variants
  const currentSrcSet = (stage === 0 && useSrcSet) ? getImageSrcSet(src) : undefined;

  const handleImgError = (e) => {
    // If variant fails and is different from base URL, fall back to base URL (stage 1)
    if (stage === 0 && variantUrl !== baseOriginalUrl) {
      setStage(1);
    } else {
      // Base URL also failed (or variant was already base URL) -> fallback to placeholder (stage 2)
      setStage(2);
      if (onError) onError(e);
    }
  };

  return (
    <img
      src={currentSrc}
      srcSet={currentSrcSet}
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
