'use client'

import * as React from 'react'
import { useEffect, useState } from 'react'

interface ProcessedContentProps {
  htmlContent: string
  className?: string
}

/**
 * Client component that sanitizes and renders HTML content.
 * The HTML should already be processed on the server (links replaced, etc.)
 */
export default function ProcessedContent({ htmlContent, className }: ProcessedContentProps) {
  const [sanitizedContent, setSanitizedContent] = useState('')

  useEffect(() => {
    // Dynamic import DOMPurify only in the browser to avoid jsdom loading during build
    import('isomorphic-dompurify').then((module) => {
      const DOMPurify = module.default
      
      // Sanitize on client side
      const sanitized = DOMPurify.sanitize(htmlContent, {
        ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'img', 'video', 'div', 'span', 'blockquote', 'code', 'pre', 'table', 'thead', 'tbody', 'tr', 'th', 'td'],
        ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'id', 'target', 'rel', 'poster', 'controls', 'muted', 'autoplay', 'loop', 'preload', 'playsinline', 'aria-label']
      })
      setSanitizedContent(sanitized)
    })
  }, [htmlContent])

  if (!sanitizedContent) {
    return <div className={className} />
  }

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  )
}
