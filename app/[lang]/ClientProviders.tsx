'use client'

import React from 'react'
import CartSidebar from '@/components/cart/CartSidebar'
import { ThemeProvider } from 'next-themes'
import { Toaster } from '@/components/ui/toaster'

interface ClientProvidersProps {
  children: React.ReactNode
  lang: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dict: any
}

export default function ClientProviders({ children, lang, dict }: ClientProvidersProps) {
  // Note: Zustand's `persist` automatically handles cart hydration now.
  // We no longer need complex useEffects to initialize the cart.

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
      <Toaster />
      <CartSidebar dict={dict} lang={lang} />
    </ThemeProvider>
  )
}