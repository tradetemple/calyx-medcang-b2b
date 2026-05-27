'use client'

import { useEffect, useState } from 'react'

interface ProcessedContentProps {
  htmlContent: string
  className?: string
}

export default function ProcessedContent({ htmlContent, className }: ProcessedContentProps) {
  const [sanitizedContent, setSanitizedContent] = useState('')

  useEffect(() => {
    import('isomorphic-dompurify').then((module) => {
      const DOMPurify = module.default
      
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
