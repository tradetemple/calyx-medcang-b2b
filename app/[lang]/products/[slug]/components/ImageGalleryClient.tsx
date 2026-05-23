'use client'

import { useState, useEffect, Dispatch, SetStateAction, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import OptimizedProductImage from '@/components/products/OptimizedProductImage';
import OptimizedProductVideo from '@/components/products/OptimizedProductVideo';
import Portal from '@/components/Portal';

// We rename this to FullscreenLightbox in our minds, as that's what it actually is
const ZoomViewer = dynamic(() => import('./ZoomViewer'), { 
  ssr: false,
});

interface ImageGalleryClientProps {
  mainImage: string;
  additionalImages: string[];
  onImageSelect: Dispatch<SetStateAction<string>>;
  t: any;
}

export default function ImageGalleryClient({
  mainImage,
  additionalImages =[],
  onImageSelect,
  t,
}: ImageGalleryClientProps) {
  const [mediaError, setMediaError] = useState<Record<string, boolean>>({});
  const [activeIndex, setActiveIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [heroLoaded, setHeroLoaded] = useState(false);

  // --- HOVER ZOOM STATE ---
  const [showMagnifier, setShowMagnifier] = useState(false);
  const [magnifierPos, setMagnifierPos] = useState({ x: 0, y: 0 });

  const isVideoUrl = useCallback((url: string) => {
    if (!url) return false;
    const videoExtensions =['.mp4', '.webm', '.mov', '.avi'];
    return videoExtensions.some(ext => url.toLowerCase().includes(ext));
  },[]);

  useEffect(() => {
    if (mainImage && isVideoUrl(mainImage)) {
      setHeroLoaded(true);
    }
    const timer = setTimeout(() => setHeroLoaded(true), 2500);
    return () => clearTimeout(timer);
  }, [mainImage, isVideoUrl]);

  const handleHeroLoad = useCallback(() => {
    setHeroLoaded(true);
  },[]);

  // Calculate mouse position for zoom panning
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!showMagnifier) return;
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setMagnifierPos({ x, y });
  }, [showMagnifier]);

  const allMedia = useMemo(() => {
    const uniqueImages = new Set<string>();
    if (mainImage) uniqueImages.add(mainImage);
    additionalImages.forEach((img) => uniqueImages.add(img));

    return Array.from(uniqueImages)
      .filter(Boolean)
      .filter((media) => !mediaError[media])
      .sort();
  },[additionalImages, mainImage, mediaError]);

  useEffect(() => {
    if (mainImage && !mediaError[mainImage]) {
      const newIndex = allMedia.indexOf(mainImage);
      setActiveIndex(newIndex >= 0 ? newIndex : 0);
    }
  },[mainImage, mediaError, allMedia]);

  if (allMedia.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center rounded-lg bg-gray-50">
        <div className="text-gray-400">{t.common.images.noMedia}</div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full flex flex-col h-full">
        
        {/* HERO IMAGE CONTAINER - Hidden since static image is already visible */}
        <div className="relative w-full overflow-hidden bg-white flex items-center justify-center group" style={{ height: 'calc(100% - 68px)' }}>
          
          <button
            type="button" 
            onClick={(e) => {
              e.stopPropagation();
              setIsFullscreen(true);
            }}
            className="absolute top-4 right-4 z-40 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-opacity opacity-0 group-hover:opacity-100"
            title="Expand Gallery"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>

          <div
            key={mainImage}
            className="w-full h-full relative cursor-crosshair" // Changed cursor to crosshair
            onMouseEnter={() => !isVideoUrl(mainImage) && setShowMagnifier(true)}
            onMouseLeave={() => setShowMagnifier(false)}
            onMouseMove={handleMouseMove}
            onClick={() => {
                if (!isVideoUrl(mainImage)) setIsFullscreen(true);
            }}
          >
            {isVideoUrl(mainImage) ? (
              <OptimizedProductVideo
                src={mainImage}
                alt={t?.common?.product || "Product"}
                fill
                className="object-contain object-center"
                showSpaceIcon={false}
                controls={true}
                muted={true}
                onError={() => {
                  setMediaError((prev) => ({ ...prev, [mainImage]: true }));
                  handleHeroLoad(); 
                }}
              />
            ) : (
              <OptimizedProductImage
                src={mainImage}
                alt={t?.common?.product || "Product"}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                priority={true} 
                className="object-contain object-center"
                showSpaceIcon={false}
                watermarkSize="large"
                onLoad={handleHeroLoad} 
                onError={() => {
                  setMediaError((prev) => ({ ...prev, [mainImage]: true }));
                  handleHeroLoad(); 
                }}
              />
            )}

            {/* TRUE HOVER MAGNIFIER - ONLY MOUNTS/LOADS ON INTERACTION */}
            {showMagnifier && !isVideoUrl(mainImage) && (
              <div className="hidden md:block absolute inset-0 z-30 pointer-events-none bg-white overflow-hidden">
                <img 
                  src={mainImage} // This bypasses the optimizer proxy to pull the original high-res Supabase file
                  alt="Zoomed Product"
                  className="absolute max-w-none"
                  style={{
                    width: '250%',     // 2.5x Zoom Scale
                    height: '250%',
                    left: `-${magnifierPos.x * 1.5}%`, // Panning math calculation
                    top: `-${magnifierPos.y * 1.5}%`,
                    objectFit: 'cover'
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* THUMBNAILS CONTAINER */}
        {allMedia.length > 1 && (
          <div className="flex flex-wrap items-center bg-white min-h-[40px] md:min-h-[68px]">
            {allMedia.map((media, index) => (
              <button
                key={media}
                type="button"
                onClick={() => {
                  onImageSelect(media);
                  setActiveIndex(index);
                }}
                className={`relative w-10 h-10 md:w-20 md:h-20 overflow-hidden flex-shrink-0 transition-all duration-200 ${
                  mainImage === media
                    ? 'border-black opacity-100' 
                    : 'border-transparent opacity-50 hover:opacity-70'
                }`}
              >
                {!heroLoaded ? (
                  <div className="w-full h-full bg-gradient-to-br from-[#f7f7f7] to-[#eaeaea]" />
                ) : isVideoUrl(media) ? (
                  <OptimizedProductVideo
                    src={media}
                    alt={`Video thumbnail ${index + 1}`}
                    fill
                    className="object-cover thumbnail"
                    showSpaceIcon={false}
                    controls={false}
                    muted={true}
                    isThumbnail={true}
                    onError={() => {
                      setMediaError((prev) => ({ ...prev, [media]: true }));
                    }}
                  />
                ) : (
                  <OptimizedProductImage
                    src={media}
                    alt={`Thumbnail ${index + 1}`}
                    fill
                    sizes="64px"
                    priority={false} 
                    isThumbnail={true}
                    className="object-cover"
                    showSpaceIcon={false}
                    onError={() => {
                      setMediaError((prev) => ({ ...prev, [media]: true }));
                    }}
                  />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {isFullscreen && (
        <Portal>
          <ZoomViewer 
            allMedia={allMedia}
            activeIndex={activeIndex}
            onClose={() => setIsFullscreen(false)}
            onSelect={(media) => {
              onImageSelect(media);
              const newIndex = allMedia.indexOf(media);
              if (newIndex >= 0) setActiveIndex(newIndex);
            }}
            t={t}
          />
        </Portal>
      )}
    </>
  );
}