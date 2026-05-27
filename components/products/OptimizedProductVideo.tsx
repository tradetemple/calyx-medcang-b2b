'use client'

import { useRef, useEffect } from 'react'

interface OptimizedProductVideoProps {
    src: string | null | undefined
    alt?: string
    className?: string
    width?: number
    height?: number
    fill?: boolean
    onLoad?: () => void
    onError?: () => void
    controls?: boolean
    muted?: boolean
    autoPlay?: boolean
    loop?: boolean
    poster?: string
    isThumbnail?: boolean
}

export default function OptimizedProductVideo({
    src,
    alt = 'Product video',
    className = '',
    width,
    height,
    fill = false,
    onLoad,
    onError,
    controls = true,
    muted = true,
    autoPlay = false,
    loop = false,
    poster,
    isThumbnail = false
}: OptimizedProductVideoProps) {
    const videoRef = useRef<HTMLVideoElement>(null)

    useEffect(() => {
        const video = videoRef.current
        if (!video || !src) return

        const handleCanPlay = () => onLoad?.()
        const handleError = () => onError?.()

        video.addEventListener('canplay', handleCanPlay)
        video.addEventListener('error', handleError)

        return () => {
            video.removeEventListener('canplay', handleCanPlay)
            video.removeEventListener('error', handleError)
        }
    }, [src, onLoad, onError])

    const handleVideoClick = (e: React.MouseEvent<HTMLVideoElement>) => {
        if (isThumbnail) return;

        e.stopPropagation();
    }

    if (!src) {
        return (
            <div className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`}>
                <div className="text-gray-400">No video available</div>
            </div>
        )
    }

    const videoProps = {
        ref: videoRef,
        src,
        className: `${className} product-gallery`,
        controls: isThumbnail ? false : controls,
        muted,
        autoPlay,
        loop,
        poster,
        preload: 'metadata' as const,
        playsInline: true,
        'aria-label': alt,
        onClick: handleVideoClick, 
        ...(width && height && !fill ? { width, height } : {}),
        ...(fill ? { style: { width: '100%', height: '100%', objectFit: 'cover' as const } } : {})
    }

    return (
        <div className={`relative bg-black flex items-center justify-center overflow-hidden ${fill ? 'w-full h-full' : ''}`}>
            
            <video 
                {...videoProps} 
                className={`${videoProps.className} ${isThumbnail ? 'pointer-events-none' : ''}`}
            />

            {isThumbnail && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="bg-black/60 rounded-full p-2">
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    </div>
                </div>
            )}
        </div>
    )
}