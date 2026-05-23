'use client';

import { useState, useEffect } from 'react';
import { ImageGalleryWrapper } from './ClientComponentWrappers';
import { useProductVariantStore } from '@/stores/productVariantStore';

interface ProductHeroClientProps {
  mainImage: string;
  additionalImages: string[];
  productId: string;
  t: any;
}

export default function ProductHeroClient({ mainImage, additionalImages, productId, t }: ProductHeroClientProps) {
  const variantImage = useProductVariantStore((state) => state.variantImages[productId]);
  const [selectedImage, setSelectedImage] = useState(mainImage);
  
  // NEW: Delay mounting of the interactive gallery
  const [shouldMount, setShouldMount] = useState(false);

  useEffect(() => {
    // Wait for the browser to be "Idle" (LCP is usually done by then)
    const timer = setTimeout(() => {
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(() => setShouldMount(true));
      } else {
        setShouldMount(true);
      }
    }, 2000); // 2-second head start for the LCP image
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (variantImage) setSelectedImage(variantImage);
  }, [variantImage]);

  if (!shouldMount) return null; // STOPS hydration-block for 2 seconds

  const allImages = Array.from(new Set([mainImage, ...additionalImages]));

  return (
    <div className="absolute inset-0 w-full h-full animate-in fade-in duration-700 pointer-events-none">
      <div className="pointer-events-auto">
        <ImageGalleryWrapper
          mainImage={selectedImage}
          additionalImages={allImages}
          onImageSelect={setSelectedImage}
          t={t}
        />
      </div>
    </div>
  );
}