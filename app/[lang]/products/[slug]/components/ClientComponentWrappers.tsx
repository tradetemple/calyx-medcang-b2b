'use client'

import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { getDictionary } from '@/app/[lang]/dictionaries';

import { Dispatch, SetStateAction } from 'react';

interface ImageGalleryProps {
  mainImage: string;
  additionalImages: string[];
  onImageSelect: Dispatch<SetStateAction<string>>;
  t: Awaited<ReturnType<typeof getDictionary>>;
}

const ImageGalleryClientComponent = dynamic(() => import('./ImageGalleryClient'), {
  loading: () => null,
  ssr: false
});

export function ImageGalleryWrapper(props: ImageGalleryProps) {
  return (
    <Suspense fallback={null}>
      <ImageGalleryClientComponent {...props} />
    </Suspense>
  )
}
