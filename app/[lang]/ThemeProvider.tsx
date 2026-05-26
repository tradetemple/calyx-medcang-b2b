'use client'

import { createContext, useEffect, useState, ReactNode } from 'react'
import { SiteSettings } from '@/types/database'

declare global {
  interface Window {
    __NEXT_THEME__?: {
      preference: 'light' | 'dark' | 'system',
      active: 'light' | 'dark'
    }
  }
}

interface ThemeContextType {
  settings: SiteSettings
  theme: 'light'
  themePreference: 'light'
  setTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

function hexToHsl(hex: string): string {
  try {
    if (!/^#[0-9A-F]{6}$/i.test(hex)) {
      console.warn(`Invalid hex color format: ${hex}`);
      return '0 0% 0%';
    }

    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }

      h = Math.round(h * 60);
    }

    s = Math.round(s * 100);
    l = Math.round(l * 100);

    return `${h} ${s}% ${l}%`;
  } catch (e) {
    console.error('Error converting hex to HSL:', e);
    return '0 0% 0%';
  }
}

interface ThemeProviderProps {
  children: ReactNode
  initialSettings: SiteSettings
}

export function ThemeProvider({ children, initialSettings }: ThemeProviderProps) {
  const [settings] = useState<SiteSettings>(initialSettings)

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement
    root.classList.remove('dark')
    root.classList.add('light')

    if (settings.primary_color) {
      root.style.setProperty('--color-primary', hexToHsl(settings.primary_color))
    }

    if (settings.secondary_color) {
      root.style.setProperty('--color-secondary', hexToHsl(settings.secondary_color))
    }

    if (settings.text_color) {
      root.style.setProperty('--color-bg-main', hexToHsl(settings.text_color))
    }
    if (settings.background_color) {
      root.style.setProperty('--color-text-main', hexToHsl(settings.background_color))
    }

    if (settings.text_secondary_color) {
      root.style.setProperty('--color-bg-secondary', hexToHsl(settings.text_secondary_color))
    } else if (settings.text_color) {
      const lightBg = createLighterVariant(settings.text_color, 0.15)
      root.style.setProperty('--color-bg-secondary', hexToHsl(lightBg))
    }

    if (settings.background_secondary) {
      root.style.setProperty('--color-text-secondary', hexToHsl(settings.background_secondary))
    } else if (settings.background_color) {
      const darkText = createDarkerVariant(settings.background_color, 0.3)
      root.style.setProperty('--color-text-secondary', hexToHsl(darkText))
    }

    const createHslVariants = (color: string, prefix: string) => {
      try {
        if (!/^#[0-9A-F]{6}$/i.test(color)) {
          console.warn(`Invalid color format for ${prefix}: ${color}`);
          root.style.setProperty(`${prefix}-light`, hexToHsl(color)); 
          root.style.setProperty(`${prefix}-dark`, hexToHsl(color)); 
          return;
        }

        const r = parseInt(color.slice(1, 3), 16)
        const g = parseInt(color.slice(3, 5), 16)
        const b = parseInt(color.slice(5, 7), 16)

        const lightR = Math.min(255, Math.round(r + (255 - r) * 0.3))
        const lightG = Math.min(255, Math.round(g + (255 - g) * 0.3))
        const lightB = Math.min(255, Math.round(b + (255 - b) * 0.3))

        const darkR = Math.round(r * 0.7)
        const darkG = Math.round(g * 0.7)
        const darkB = Math.round(b * 0.7)

        const lightHex = `#${lightR.toString(16).padStart(2, '0')}${lightG.toString(16).padStart(2, '0')}${lightB.toString(16).padStart(2, '0')}`;
        const darkHex = `#${darkR.toString(16).padStart(2, '0')}${darkG.toString(16).padStart(2, '0')}${darkB.toString(16).padStart(2, '0')}`;

        root.style.setProperty(`${prefix}-light`, hexToHsl(lightHex))
        root.style.setProperty(`${prefix}-dark`, hexToHsl(darkHex))
      } catch (e) {
        console.error(`Error processing color variants for ${prefix}:`, e);
        root.style.setProperty(`${prefix}-light`, hexToHsl(color));
        root.style.setProperty(`${prefix}-dark`, hexToHsl(color));
      }
    }

    if (settings.primary_color) {
      createHslVariants(settings.primary_color, '--color-primary')
    }
    if (settings.secondary_color) {
      createHslVariants(settings.secondary_color, '--color-secondary')
    }

    if (settings.status_error_color) {
      root.style.setProperty('--color-status-error', hexToHsl(settings.status_error_color))
    } else {
      root.style.setProperty('--color-status-error', hexToHsl('#ef4444'))
    }

    if (settings.border_color) {
      root.style.setProperty('--color-border', hexToHsl(settings.border_color))
    } else if (settings.text_color) {
      const borderColor = createDarkerVariant(settings.text_color, 0.2)
      root.style.setProperty('--color-border', hexToHsl(borderColor))
    }

    if (settings.static_black_color && /^#[0-9A-F]{6}$/i.test(settings.static_black_color)) {
      root.style.setProperty('--color-static-black', hexToHsl(settings.static_black_color))
    } else {
      root.style.setProperty('--color-static-black', '0 0% 0%')
    }

    if (settings.static_white_color && /^#[0-9A-F]{6}$/i.test(settings.static_white_color)) {
      root.style.setProperty('--color-static-white', hexToHsl(settings.static_white_color))
    } else {
      root.style.setProperty('--color-static-white', '0 0% 100%')
    }

    if (settings.status_success_color) {
      root.style.setProperty('--color-status-success', hexToHsl(settings.status_success_color))
    } else {
      root.style.setProperty('--color-status-success', hexToHsl('#22c55e'))
    }

    if (settings.status_warning_color) {
      root.style.setProperty('--color-status-warning', hexToHsl(settings.status_warning_color))
    } else {
      root.style.setProperty('--color-status-warning', hexToHsl('#f59e0b'))
    }

    if (settings.status_info_color) {
      root.style.setProperty('--color-status-info', hexToHsl(settings.status_info_color))
    } else {
      root.style.setProperty('--color-status-info', hexToHsl('#3b82f6'))
    }

  }, [settings, mounted])

  const handleSetTheme = () => {
  }

  const contextValue = {
    settings,
    theme: 'light' as const,
    themePreference: 'light' as const,
    setTheme: handleSetTheme
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  )
}

function createLighterVariant(hexColor: string, amount: number): string {
  try {
    if (!/^#[0-9A-F]{6}$/i.test(hexColor)) {
      return hexColor;
    }

    const r = parseInt(hexColor.slice(1, 3), 16)
    const g = parseInt(hexColor.slice(3, 5), 16)
    const b = parseInt(hexColor.slice(5, 7), 16)

    const lightR = Math.min(255, Math.round(r + (255 - r) * amount))
    const lightG = Math.min(255, Math.round(g + (255 - g) * amount))
    const lightB = Math.min(255, Math.round(b + (255 - b) * amount))

    return `#${lightR.toString(16).padStart(2, '0')}${lightG.toString(16).padStart(2, '0')}${lightB.toString(16).padStart(2, '0')}`
  } catch {
    return hexColor;
  }
}

function createDarkerVariant(hexColor: string, amount: number): string {
  try {
    if (!/^#[0-9A-F]{6}$/i.test(hexColor)) {
      return hexColor;
    }

    const r = parseInt(hexColor.slice(1, 3), 16)
    const g = parseInt(hexColor.slice(3, 5), 16)
    const b = parseInt(hexColor.slice(5, 7), 16)

    const darkR = Math.round(r * (1 - amount))
    const darkG = Math.round(g * (1 - amount))
    const darkB = Math.round(b * (1 - amount))

    return `#${darkR.toString(16).padStart(2, '0')}${darkG.toString(16).padStart(2, '0')}${darkB.toString(16).padStart(2, '0')}`
  } catch {
    return hexColor;
  }
}
