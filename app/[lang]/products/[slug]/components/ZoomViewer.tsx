'use client'

import { useState, useEffect, useCallback, useRef } from 'react';
import OptimizedProductVideo from '@/components/products/OptimizedProductVideo';

interface ZoomViewerProps {
  allMedia: string[];
  activeIndex: number;
  onClose: () => void;
  onSelect: (media: string) => void;
  t: any;
}

export default function ZoomViewer({
  allMedia,
  activeIndex,
  onClose,
  onSelect,
  t
}: ZoomViewerProps) {
  const mainImage = allMedia[activeIndex] || allMedia[0];
  
  const [transform, setTransform] = useState({ scale: 1, x: 0, y: 0 });
  
  const[isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const isVideoUrl = useCallback((url: string) => {
    if (!url) return false;
    const videoExtensions = ['.mp4', '.webm', '.mov', '.avi'];
    return videoExtensions.some(ext => url.toLowerCase().includes(ext));
  },[]);

  const isVideo = isVideoUrl(mainImage);

  const handleNext = useCallback((e?: React.MouseEvent | KeyboardEvent) => {
    e?.stopPropagation();
    if (allMedia.length === 0) return;
    const nextIndex = (activeIndex + 1) % allMedia.length;
    onSelect(allMedia[nextIndex]);
    setTransform({ scale: 1, x: 0, y: 0 }); 
  }, [activeIndex, allMedia, onSelect]);

  const handlePrev = useCallback((e?: React.MouseEvent | KeyboardEvent) => {
    e?.stopPropagation();
    if (allMedia.length === 0) return;
    const prevIndex = (activeIndex - 1 + allMedia.length) % allMedia.length;
    onSelect(allMedia[prevIndex]);
    setTransform({ scale: 1, x: 0, y: 0 });
  }, [activeIndex, allMedia, onSelect]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  },[handleNext, handlePrev, onClose]);

  const updateTransform = useCallback((newScale: number, clientX = window.innerWidth / 2, clientY = window.innerHeight / 2) => {
    setTransform(prev => {
      const targetScale = Math.max(1, Math.min(newScale, 4)); 
      if (targetScale === prev.scale) return prev;

      if (targetScale === 1) return { scale: 1, x: 0, y: 0 };

      const ratio = targetScale / prev.scale;
      const dx = (clientX - window.innerWidth / 2) - prev.x;
      const dy = (clientY - window.innerHeight / 2) - prev.y;

      return {
        scale: targetScale,
        x: prev.x - dx * (ratio - 1),
        y: prev.y - dy * (ratio - 1)
      };
    });
  },[]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || isVideo) return;

    const handleNativeWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomDirection = e.deltaY < 0 ? 0.25 : -0.25;
      updateTransform(transform.scale + zoomDirection, e.clientX, e.clientY);
    };
    
    el.addEventListener('wheel', handleNativeWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleNativeWheel);
  }, [isVideo, updateTransform, transform.scale]); 


  const onPointerDown = (e: React.PointerEvent) => {
    if (isVideo) return;
    setIsDragging(true);
    dragStart.current = {
      x: e.clientX - transform.x,
      y: e.clientY - transform.y
    };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    
    if (transform.scale > 1) {
      setTransform(prev => ({
        ...prev,
        x: e.clientX - dragStart.current.x,
        y: e.clientY - dragStart.current.y
      }));
    } else {
      setTransform(prev => ({ ...prev, x: e.clientX - dragStart.current.x }));
    }
  };

  const onPointerUp = () => {
    setIsDragging(false);
    
    if (transform.scale === 1) {
      if (transform.x > 100) handlePrev();
      else if (transform.x < -100) handleNext();
      else setTransform(prev => ({ ...prev, x: 0, y: 0 }));
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    if (transform.scale > 1) {
      updateTransform(1);
    } else {
      updateTransform(2.5, e.clientX, e.clientY); 
    }
  };

  const zoomIn = (e?: React.MouseEvent) => { e?.stopPropagation(); updateTransform(transform.scale + 0.5); };
  const zoomOut = (e?: React.MouseEvent) => { e?.stopPropagation(); updateTransform(transform.scale - 0.5); };
  const resetZoom = (e?: React.MouseEvent) => { e?.stopPropagation(); updateTransform(1); };


  return (
    <div
      className="fixed inset-0 bg-black/95 z-[999999] flex flex-col items-center justify-center animate-in fade-in duration-300"
      style={{ zIndex: 999999 }}
      onClick={onClose} 
    >
      <div className="absolute top-0 w-full p-4 flex justify-between items-center z-[1000000] bg-gradient-to-b from-black/60 to-transparent">
        <div className="text-white/70 text-sm font-medium">
          {activeIndex + 1} / {allMedia.length}
        </div>
        <button
          type="button"
          title={t.mobileMenu.close}
          className="text-white/70 hover:text-white p-2 transition-colors"
          onClick={onClose}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div 
        ref={containerRef}
        className="relative w-full h-full flex items-center justify-center overflow-hidden touch-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        onDoubleClick={handleDoubleClick}
        onClick={(e) => e.stopPropagation()} 
      >
        {isVideo ? (
          <OptimizedProductVideo
            src={mainImage}
            alt={t?.common?.product || t.common.images.video}
            fill
            className="object-contain"
            controls={true}
            muted={false}
          />
        ) : (
          <img
            src={mainImage} 
            alt={t?.common?.product || t.common.images.photo}
            draggable={false} 
            className="max-h-[95vh] max-w-[95vw] object-contain will-change-transform"
            style={{
              transform: `translate3d(${transform.x}px, ${transform.y}px, 0) scale(${transform.scale})`,
              transition: isDragging ? 'none' : 'transform 0.2s cubic-bezier(0.2, 0, 0.2, 1)',
              cursor: transform.scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in',
            }}
          />
        )}
      </div>

      {allMedia.length > 1 && transform.scale === 1 && (
        <>
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white z-[1000000] p-4 bg-black/40 hover:bg-black/60 rounded-full backdrop-blur transition-all hidden md:block"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white z-[1000000] p-4 bg-black/40 hover:bg-black/60 rounded-full backdrop-blur transition-all hidden md:block"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {!isVideo && (
        <div 
          className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 px-6 py-3 bg-black/80 backdrop-blur-md rounded-full border border-white/20 shadow-2xl z-[1000000]"
          onClick={(e) => e.stopPropagation()}
        >
          <button 
            onClick={zoomOut}
            disabled={transform.scale === 1}
            className="text-white/80 hover:text-white disabled:opacity-30 transition-colors p-1"
            title={t.common.images.zoomOut}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
            </svg>
          </button>
          
          <div className="w-16 text-center text-white font-mono text-sm select-none">
            {Math.round(transform.scale * 100)}%
          </div>

          <button 
            onClick={zoomIn}
            disabled={transform.scale >= 4}
            className="text-white/80 hover:text-white disabled:opacity-30 transition-colors p-1"
            title={t.common.images.zoomIn}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
            </svg>
          </button>

          {transform.scale > 1 && (
            <>
              <div className="w-px h-6 bg-white/30 mx-2" />
              <button 
                onClick={resetZoom}
                className="text-white/90 hover:text-white text-sm font-semibold transition-colors uppercase tracking-wide"
              >
                {t.common.images.reset}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}