'use client';

import { useState, useEffect } from 'react';

interface AnimatedBannerProps {
  texts: string[];
  intervalMs?: number;
}

export default function AnimatedBanner({ texts, intervalMs = 4000 }: AnimatedBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Prevent interval if there's no data or only 1 item
    if (!texts || texts.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % texts.length);
    }, intervalMs);

    return () => clearInterval(interval);
  }, [texts, intervalMs]);

  if (!texts || texts.length === 0) return null;

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {texts.map((text, index) => (
        <h3
          key={index}
          className={`absolute w-full text-center text-xs font-semibold uppercase tracking-wide text-static-white transition-all duration-700 ease-in-out ${
            index === currentIndex 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 -translate-y-4 pointer-events-none'
          }`}
        >
          {text}
        </h3>
      ))}
    </div>
  );
}