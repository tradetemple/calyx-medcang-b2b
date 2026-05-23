// app/manifest.ts
import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Zeyana | Moissanite Engagement Rings',
    short_name: 'Zeyana',
    description: 'Fine Jewellery & Moissanite Engagement Rings',
    start_url: '/',
    display: 'standalone',
    background_color: '#f8f7f4', // Your bg-main color
    theme_color: '#102f5b',      // This fixes the "Address Bar Theme" error
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/icon-maskable-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable', // This fixes the "Maskable Icon" error
      },
    ],
  }
}