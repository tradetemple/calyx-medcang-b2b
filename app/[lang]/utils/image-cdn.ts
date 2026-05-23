// utils/image-cdn.ts

export function getCdnUrl(src: string | null | undefined, options: { 
  width?: number, 
  quality?: number, 
  format?: string 
} = {}) {
  if (!src) return '';
  if (process.env.NODE_ENV === 'development' || (!src.startsWith('http') && !src.startsWith('/'))) return src;

  const cleanSrc = src.startsWith('/') ? src.slice(1) : src;
  const { width, quality = 75, format = 'auto' } = options;

  // VIDEO LOGIC (Uses the March 6th Media Engine)
  if (src.match(/\.(mp4|webm|mov)$/i)) {
    // Media engine ONLY likes width. No quality/format/fit.
    return `/cdn-cgi/media/${width ? `width=${width}/` : ''}${cleanSrc}`;
  }

  // IMAGE LOGIC (Uses the standard Image Engine)
  const params = [
    width ? `width=${width}` : '',
    `quality=${quality}`,
    `format=${format}`,
    'fit=cover'
  ].filter(Boolean).join(',');

  return `/cdn-cgi/image/${params}/${cleanSrc}`;
}