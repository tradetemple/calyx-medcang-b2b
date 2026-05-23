'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

interface NavigationLogoProps {
  siteName: string | any
  siteLogo: string | any
  darkModeLogo?: string | any
}

export default function NavigationLogo({ 
  siteName, 
  siteLogo, 
  darkModeLogo 
}: NavigationLogoProps) {
  const [mounted, setMounted] = useState(false)
  
  // Mark component as mounted to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])
  
  // During SSR and initial render, default to dark mode logo to match ThemeProvider's SSR default
  // This prevents the flash when the page loads
  const logoSrc = (!mounted) && darkModeLogo ? darkModeLogo : siteLogo
  
  return (
    <Image 
      src={logoSrc} 
      alt={siteName} 
      width={60}
      height={30}
      className="w-28 h-auto lg:w-36 object-contain !overflow-hidden" 
      priority={true}
      fetchPriority="high"
      loading="eager"
    />
  )
}   