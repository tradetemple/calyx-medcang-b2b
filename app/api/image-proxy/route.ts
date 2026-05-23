/* eslint-disable */
import { NextRequest, NextResponse } from 'next/server'
import { rateLimit, getCorsHeaders } from '@/lib/api-protection';

interface ImageProxyParams {
  url: string
  width?: number
  height?: number
  quality?: number
  format?: 'webp' | 'avif' | 'jpeg' | 'png'
  blur?: boolean
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside'
}

// Supported image formats for optimization
const SUPPORTED_FORMATS = ['webp', 'avif', 'jpeg', 'png'] as const
const DEFAULT_QUALITY = 85
const BLUR_QUALITY = 20
const BLUR_SIZE = 40

// Cache headers for optimized images
const CACHE_HEADERS = {
  'Cache-Control': 'public, max-age=2592000, immutable', // 30 days
  'CDN-Cache-Control': 'public, max-age=31536000', // 1 year for CDN
}

// Define the return type for processed images
interface ProcessedImageResult {
  buffer: Buffer
  contentType: string
  metadata: {
    width: number
    height: number
    format: string
    size: number
    processedSize: number
  }
}

// Request queue to handle concurrent requests
const requestQueue = new Map<string, Promise<ProcessedImageResult>>()

// Rate limiting for Supabase requests
let lastRequestTime = 0
const MIN_REQUEST_INTERVAL = 50 // 50ms between requests

// Enhanced image fetching with better error handling
async function fetchImageWithRetry(url: string, retries = 3): Promise<Response> {
  // Rate limiting
  const now = Date.now()
  const timeSinceLastRequest = now - lastRequestTime
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    await new Promise(resolve => setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest))
  }
  lastRequestTime = Date.now()

  let lastError: Error | null = null

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10s timeout

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'NextJS-Image-Proxy/2.0',
          'Accept': 'image/*',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        },
        signal: controller.signal,
        next: { revalidate: 2592000 }
      })

      clearTimeout(timeoutId)

      if (response.ok) {
        return response
      }

      // Handle specific Supabase errors
      if (response.status === 402) {
        throw new Error('Supabase transformation quota exceeded')
      }

      if (response.status === 404) {
        throw new Error('Image not found')
      }

      if (response.status >= 500) {
        throw new Error(`Server error: ${response.status}`)
      }

      throw new Error(`HTTP ${response.status}: ${response.statusText}`)

    } catch (error) {
      lastError = error as Error

      if (attempt === retries) {
        throw lastError
      }

      // Exponential backoff
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000)
      console.warn(`Image fetch attempt ${attempt} failed, retrying in ${delay}ms:`, error)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  throw lastError || new Error('Unknown fetch error')
} 

// Cached image processing function with request deduplication
async function getCachedProcessedImage(params: ImageProxyParams): Promise<ProcessedImageResult> {
  // Validate Supabase URL (security check)
  if (!isValidSupabaseUrl(params.url)) {
    throw new Error('Invalid Supabase URL')
  }

  // Create a unique key for request deduplication
  const requestKey = `${params.url}:${params.width}:${params.height}:${params.quality}:${params.format}`

  // Check if there's already a request in progress for this image
  if (requestQueue.has(requestKey)) {
    return await requestQueue.get(requestKey)!
  }

  // Create the processing promise
  const processingPromise = (async () => {
    try {
      // Use Supabase's built-in image transformations instead of sharp
      // Supabase Storage provides URL-based transformations
      const transformedUrl = buildSupabaseTransformUrl(params)
      
      // Fetch the transformed image from Supabase
      const imageResponse = await fetchImageWithRetry(transformedUrl)
      const imageBuffer = await imageResponse.arrayBuffer()
      const buffer = Buffer.from(imageBuffer)

      // Validate image buffer
      if (buffer.length === 0) {
        throw new Error('Empty image buffer received')
      }

      // Get content type from response
      const contentType = imageResponse.headers.get('content-type') || 'image/webp'

      // For metadata, we'll use approximate values based on requested dimensions
      // Supabase transformations handle the actual processing
      const metadata = {
        width: params.width || 800,
        height: params.height || 600,
        format: params.format || 'webp',
        size: buffer.length,
        processedSize: buffer.length
      }

      return {
        buffer,
        contentType,
        metadata
      }
    } finally {
      // Clean up the request from queue
      requestQueue.delete(requestKey)
    }
  })()

  // Store the promise in the queue
  requestQueue.set(requestKey, processingPromise)

  return await processingPromise
}

/**
 * Build Supabase Storage transformation URL
 * Uses Supabase's built-in image transformation API
 */
function buildSupabaseTransformUrl(params: ImageProxyParams): string {
  try {
    const urlObj = new URL(params.url)
    
    // Convert /storage/v1/object/public/ to /storage/v1/render/image/public/
    const renderPath = urlObj.pathname.replace(
      '/storage/v1/object/public/',
      '/storage/v1/render/image/public/'
    )
    
    // Build transformation URL with query parameters
    const transformUrl = new URL(renderPath, urlObj.origin)
    
    // Add transformation parameters
    if (params.width) {
      transformUrl.searchParams.set('width', params.width.toString())
    }
    if (params.height) {
      transformUrl.searchParams.set('height', params.height.toString())
    }
    if (params.quality) {
      transformUrl.searchParams.set('quality', params.quality.toString())
    }
    if (params.format) {
      transformUrl.searchParams.set('format', params.format)
    }
    if (params.blur) {
      // For blur, use small dimensions
      transformUrl.searchParams.set('width', BLUR_SIZE.toString())
      transformUrl.searchParams.set('height', BLUR_SIZE.toString())
      transformUrl.searchParams.set('quality', BLUR_QUALITY.toString())
    }
    if (params.fit) {
      transformUrl.searchParams.set('resize', params.fit)
    }
    
    return transformUrl.toString()
  } catch (error) {
    console.error('Error building transform URL:', error)
    // Fallback to original URL
    return params.url
  }
}

// Use Edge runtime for Cloudflare Workers compatibility
export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const origin = request.headers.get('origin') || '*';
  const rateLimiter = rateLimit(100, 60000); // 100 requests per minute
  const rateResult = rateLimiter(request);
  
  if (!rateResult.allowed) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: getCorsHeaders(origin) }
    );
  }

  try {
    const { searchParams } = new URL(request.url)

    // Extract parameters
    const params: ImageProxyParams = {
      url: decodeURIComponent(searchParams.get('url') || ''),
      width: searchParams.get('w') ? parseInt(searchParams.get('w')!) : undefined,
      height: searchParams.get('h') ? parseInt(searchParams.get('h')!) : undefined,
      quality: searchParams.get('q') ? parseInt(searchParams.get('q')!) : DEFAULT_QUALITY,
      format: (searchParams.get('f') as 'webp' | 'avif' | 'jpeg' | 'png') || 'webp',
      blur: searchParams.get('blur') === 'true',
      fit: (searchParams.get('fit') as 'cover' | 'contain' | 'fill' | 'inside' | 'outside') || 'inside'
    }

    // Validate required parameters
    if (!params.url) {
      return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 })
    }

    // Validate format
    if (params.format && !SUPPORTED_FORMATS.includes(params.format)) {
      return NextResponse.json({ error: 'Unsupported format' }, { status: 400 })
    }

    // Handle local images - redirect to original
    if (params.url.startsWith('/')) {
      return NextResponse.redirect(new URL(params.url, request.url), 302)
    }

    // Validate Supabase URL (security check)
    if (!isValidSupabaseUrl(params.url)) {
      return NextResponse.json({ error: 'Invalid Supabase URL' }, { status: 400 })
    }

    try {
      // Use cached image processing
      const result = await getCachedProcessedImage(params)
      if (!result) {
        throw new Error('Failed to process image')
      }
      const { buffer: processedBuffer, contentType, metadata } = result

      // Generate ETag for better caching
      const etag = `"${Buffer.from(params.url + (params.width || '') + (params.height || '') + params.quality + params.format).toString('base64')}"`

      // Check if client has cached version
      const ifNoneMatch = request.headers.get('if-none-match')
      if (ifNoneMatch === etag) {
        return new NextResponse(null, { status: 304 })
      }

      // Return optimized image with cache headers
      return new NextResponse(processedBuffer as BodyInit, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Content-Length': processedBuffer.length.toString(),
          'ETag': etag,
          'Vary': 'Accept-Encoding',
          ...CACHE_HEADERS,
          // Add image metadata headers
          'X-Image-Width': metadata.width ? metadata.width.toString() : '0',
          'X-Image-Height': metadata.height ? metadata.height.toString() : '0',
          'X-Original-Format': metadata.format || 'unknown',
        }
      })
    } catch (processingError) {
      console.error('Image processing failed, redirecting to original:', processingError)

      // Fallback: redirect to original URL
      return NextResponse.redirect(params.url, 302)
    }

  } catch (error) {
    console.error('Image proxy error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Validate if URL is from allowed Supabase storage
 */
function isValidSupabaseUrl(url: string): boolean {
  try {
    const urlObj = new URL(url)

    // Check if it's a Supabase storage URL
    const isSupabaseStorage = urlObj.hostname.includes('.supabase.co') &&
      urlObj.pathname.includes('/storage/v1/object/')

    return isSupabaseStorage
  } catch {
    return false
  }
}