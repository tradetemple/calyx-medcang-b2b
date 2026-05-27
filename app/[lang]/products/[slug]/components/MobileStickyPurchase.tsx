'use client';

import { useEffect, useState, useRef } from 'react';

interface MobileStickyPurchaseProps {
  children: React.ReactNode;
}

export default function MobileStickyPurchase({ children }: MobileStickyPurchaseProps) {
  const [isSticky, setIsSticky] = useState(true);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSticky(!entry.isIntersecting);
      },
      {
        root: null,
        threshold: 0,
        rootMargin: '0px 0px -100px 0px',
      }
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <>
      <div ref={sentinelRef} className="h-1 lg:hidden" aria-hidden="true" />
      
      <div
        ref={containerRef}
        className={`
          ${isSticky ? 'sticky' : 'relative'} 
          bottom-0 left-0 w-full z-50 
          bg-white border-t border-border/10 
          shadow-[0_-8px_30px_rgba(0,0,0,0.12)] 
          lg:hidden
          transition-all duration-200
        `}
      >
        <div className="pb-[calc(1rem+env(safe-area-inset-bottom))] max-h-[85vh] overflow-y-auto overscroll-contain">
          {children}
        </div>
      </div>
    </>
  );
}
