'use client'

import React from 'react'
import CartSidebar from '@/components/cart/CartSidebar'
import { ThemeProvider } from 'next-themes'
import { Toaster } from '@/components/ui/toaster'

interface ClientProvidersProps {
  children: React.ReactNode
  lang: string
  dict: any
}

export default function ClientProviders({ children, lang, dict }: ClientProvidersProps) {

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
      <Toaster />
      <CartSidebar dict={dict} lang={lang} />
    </ThemeProvider>
  )
}