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
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
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