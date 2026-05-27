'use client';

import { useScrollDirection } from '@/lib/hooks/useScrollDirection';
import { useEffect, useState } from 'react';

interface NavigationBarWrapperProps {
  children: React.ReactNode;
}

export default function NavigationBarWrapper({ children }: NavigationBarWrapperProps) {
  const scrollDirection = useScrollDirection();
  const [isAtTop, setIsAtTop] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setIsAtTop(window.scrollY < 10);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      className={`sticky top-0 w-full z-[100] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        scrollDirection === 'down' && !isAtTop ? '-translate-y-full' : 'translate-y-0'
      }`}
    >
      {children}
    </div>
  );
}
