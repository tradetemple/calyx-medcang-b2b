// OptimizedProductImage.tsx
'use client'

import { useState, useMemo } from 'react'
import { getCdnUrl } from '@/app/[lang]/utils/image-cdn'

interface OptimizedProductImageProps {
  src: string | null | undefined
  alt: string
  priority?: boolean
  className?: string
  sizes?: string
  width?: number
  height?: number
  fill?: boolean
  onLoad?: () => void
  onError?: () => void
  showSpaceIcon?: boolean
  productId?: string
  isAboveFold?: boolean
  isThumbnail?: boolean // <-- WE ADDED THIS
  watermarkSize?: 'small' | 'medium' | 'large'
}

export default function OptimizedProductImage({
  src,
  alt,
  priority = false,
  className = '',
  sizes,
  width,
  height,
  fill = false,
  onLoad,
  onError,
  isAboveFold = false,
}: OptimizedProductImageProps) {
  const shouldPrioritize = priority || isAboveFold
  const [isLoading, setIsLoading] = useState(!shouldPrioritize) 
  const [hasError, setHasError] = useState(false)

  // Remove background gradient for priority images to avoid layout recalc
  const containerStyle: React.CSSProperties = fill
    ? { position: 'relative', width: '100%', height: '100%' }
    : { width, height }

  const handleLoad = () => {
    setIsLoading(false)
    if (onLoad) onLoad()
  }

  const handleError = () => {
    setIsLoading(false)
    setHasError(true)
    if (onError) onError()
  }

  if (!src || hasError) {
     return (
      <div 
        className={`relative w-full h-full flex items-center justify-center overflow-hidden ${className}`}
        style={containerStyle}
      >
        <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>
      </div>
     )
  }

  /* --- THE STRICT CDN PROXY ---
  const { proxySrc, proxySrcSet } = useMemo(() => {
    if (!src) return { proxySrc: '', proxySrcSet: '' };

    if (isThumbnail) {
      const src64 = getCdnUrl(src, { width: 64, quality: 60 });
      const src128 = getCdnUrl(src, { width: 128, quality: 60 });
      return {
        proxySrc: src64,
        proxySrcSet: `${src64} 64w, ${src128} 128w`
      };
    }

    const src400 = getCdnUrl(src, { width: 400 });
    const src600 = getCdnUrl(src, { width: 600 });
    const src800 = getCdnUrl(src, { width: 800 });
    const src1200 = getCdnUrl(src, { width: 1200 });
    const src1800 = getCdnUrl(src, { width: 1800 });
    const src2400 = getCdnUrl(src, { width: 2400 });

    return {
      proxySrc: src1200,
      proxySrcSet: `${src400} 400w, ${src600} 600w, ${src800} 800w, ${src1200} 1200w, ${src1800} 1800w, ${src2400} 2400w`
    };
  }, [src, isThumbnail]);*/

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`} style={containerStyle}>
      {/* Skip shimmer entirely for priority images */}
      {!shouldPrioritize && isLoading && (
        <div className="absolute inset-0 z-10 pointer-events-none">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
        </div>
      )}

      {/* PURE HTML5 IMG TAG */}
      <img
        src={src}
        sizes={sizes || "(max-width: 768px) 100vw, 50vw"}
        alt={alt}
        className={`w-full h-full object-cover ${
          shouldPrioritize 
            ? '' // No opacity transitions for LCP images
            : `transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`
        }`}
        fetchPriority={shouldPrioritize ? 'high' : 'auto'}
        loading={shouldPrioritize ? 'eager' : 'lazy'}
        decoding={shouldPrioritize ? 'sync' : 'async'}
        onLoad={handleLoad}
        onError={handleError}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
      />
    </div>
  )
}