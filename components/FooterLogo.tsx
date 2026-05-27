'use client'

import Image from 'next/image'

interface FooterLogoProps {
  siteName: string
  siteLogo: string
  darkModeLogo?: string
}

export default function FooterLogo({ 
  siteName, 
  siteLogo
}: FooterLogoProps) {
  const logoSrc = siteLogo
  
  return (
    <Image 
      src={logoSrc} 
      alt={siteName} 
      width={160}
      height={60}
      className="w-40 h-auto object-contain" 
      priority
    />
  )
} 