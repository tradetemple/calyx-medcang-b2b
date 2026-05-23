'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { SiteSettings } from '@/types/database'

// Define window augmentation for TypeScript
declare global {
  interface Window {
    __NEXT_THEME__?: {
      preference: 'light' | 'dark' | 'system',
      active: 'light' | 'dark'
    }
  }
}

// Define the context type
interface ThemeContextType {
  settings: SiteSettings
  theme: 'light' // Always light mode
  themePreference: 'light' // Always light mode
  setTheme: () => void // No-op function
}

// Create the context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

// Helper function to convert hex to HSL format for Tailwind opacity support
function hexToHsl(hex: string): string {
  try {
    // Ensure color is a valid hex code
    if (!/^#[0-9A-F]{6}$/i.test(hex)) {
      console.warn(`Invalid hex color format: ${hex}`);
      return '0 0% 0%'; // Default to black HSL
    }

    // Convert hex to RGB
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    // Find max and min RGB components
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
    return '0 0% 0%'; // Default to black HSL
  }
}

interface ThemeProviderProps {
  children: ReactNode
  initialSettings: SiteSettings
}

export function ThemeProvider({ children, initialSettings }: ThemeProviderProps) {
  const [settings] = useState<SiteSettings>(initialSettings)

  // Always use light mode
  const [themePreference] = useState<'light'>('light')
  const [activeTheme] = useState<'light'>('light')
  const [mounted, setMounted] = useState(false)

  // Mark component as mounted (client-side only)
  useEffect(() => {
    setMounted(true)
  }, [])

  // Effect to apply light theme
  useEffect(() => {
    if (!mounted) return;

    const currentTheme: 'light' = 'light';

    // Apply class to HTML element
    const root = document.documentElement
    root.classList.remove('dark')
    root.classList.add('light')

    // Apply CSS variables in HSL format for Tailwind opacity support
    if (settings.primary_color) {
      root.style.setProperty('--color-primary', hexToHsl(settings.primary_color))
    }

    if (settings.secondary_color) {
      root.style.setProperty('--color-secondary', hexToHsl(settings.secondary_color))
    }

    if (settings.accent_color) {
      root.style.setProperty('--color-accent', hexToHsl(settings.accent_color))
    }

    // Apply light mode colors (swap dark mode colors)
    // Swap: Dark mode text becomes light mode background
    if (settings.text_color) {
      root.style.setProperty('--color-bg-main', hexToHsl(settings.text_color))
    }
    // Swap: Dark mode background becomes light mode text
    if (settings.background_color) {
      root.style.setProperty('--color-text-main', hexToHsl(settings.background_color))
    }

    // ALSO SWAP the secondary colors
    if (settings.text_secondary_color) {
      // Dark mode text_secondary becomes light mode bg_secondary
      root.style.setProperty('--color-bg-secondary', hexToHsl(settings.text_secondary_color))
    } else if (settings.text_color) {
      // Fallback to a lighter variant of main background (which is dark mode text)
      const lightBg = createLighterVariant(settings.text_color, 0.15)
      root.style.setProperty('--color-bg-secondary', hexToHsl(lightBg))
    }

    if (settings.background_secondary) {
      // Dark mode bg_secondary becomes light mode text_secondary
      root.style.setProperty('--color-text-secondary', hexToHsl(settings.background_secondary))
    } else if (settings.background_color) {
      // Fallback to a darker variant of main text (which is dark mode background)
      const darkText = createDarkerVariant(settings.background_color, 0.3)
      root.style.setProperty('--color-text-secondary', hexToHsl(darkText))
    }

    // Color variant generation for HSL
    const createHslVariants = (color: string, prefix: string) => {
      try {
        // Ensure color is a valid hex code
        if (!/^#[0-9A-F]{6}$/i.test(color)) {
          console.warn(`Invalid color format for ${prefix}: ${color}`);
          // Use fallback
          root.style.setProperty(`${prefix}-light`, hexToHsl(color)); // Default to original
          root.style.setProperty(`${prefix}-dark`, hexToHsl(color)); // Default to original
          return;
        }

        // Convert hex to RGB for manipulation
        const r = parseInt(color.slice(1, 3), 16)
        const g = parseInt(color.slice(3, 5), 16)
        const b = parseInt(color.slice(5, 7), 16)

        // Lighter variant (blend with white)
        const lightR = Math.min(255, Math.round(r + (255 - r) * 0.3))
        const lightG = Math.min(255, Math.round(g + (255 - g) * 0.3))
        const lightB = Math.min(255, Math.round(b + (255 - b) * 0.3))

        // Darker variant (blend with black)
        const darkR = Math.round(r * 0.7)
        const darkG = Math.round(g * 0.7)
        const darkB = Math.round(b * 0.7)

        // Convert to HSL and set CSS variables
        const lightHex = `#${lightR.toString(16).padStart(2, '0')}${lightG.toString(16).padStart(2, '0')}${lightB.toString(16).padStart(2, '0')}`;
        const darkHex = `#${darkR.toString(16).padStart(2, '0')}${darkG.toString(16).padStart(2, '0')}${darkB.toString(16).padStart(2, '0')}`;

        root.style.setProperty(`${prefix}-light`, hexToHsl(lightHex))
        root.style.setProperty(`${prefix}-dark`, hexToHsl(darkHex))
      } catch (e) {
        console.error(`Error processing color variants for ${prefix}:`, e);
        // Fallback in case of unexpected errors
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
    if (settings.accent_color) {
      createHslVariants(settings.accent_color, '--color-accent')
    }

    // Set status colors if they exist in settings
    if (settings.status_error_color) {
      root.style.setProperty('--color-status-error', hexToHsl(settings.status_error_color))
    } else {
      // Fallback to a default red color
      root.style.setProperty('--color-status-error', hexToHsl('#ef4444'))
    }

    if (settings.status_error_light_color) {
      root.style.setProperty('--color-status-error-light', hexToHsl(settings.status_error_light_color))
    } else if (settings.status_error_color) {
      // Create lighter variant from the error color
      const lightErrorColor = createLighterVariant(settings.status_error_color, 0.7)
      root.style.setProperty('--color-status-error-light', hexToHsl(lightErrorColor))
    } else {
      // Fallback to a default light red color
      root.style.setProperty('--color-status-error-light', hexToHsl('#fee2e2'))
    }

    // Set light mode surface colors
    if (settings.light_mode_surface_color) {
      root.style.setProperty('--color-surface', hexToHsl(settings.light_mode_surface_color))
    } else if (settings.text_color) {
      // Default light surface - slightly darker than background
      const lightSurface = createDarkerVariant(settings.text_color, 0.08)
      root.style.setProperty('--color-surface', hexToHsl(lightSurface))
    }

    if (settings.light_mode_surface_hover_color) {
      root.style.setProperty('--color-surface-hover', hexToHsl(settings.light_mode_surface_hover_color))
    } else if (settings.text_color) {
      // Default light surface hover
      const lightSurfaceHover = createLighterVariant(settings.text_color, 0.08)
      root.style.setProperty('--color-surface-hover', hexToHsl(lightSurfaceHover))
    }

    if (settings.light_mode_surface_active_color) {
      root.style.setProperty('--color-surface-active', hexToHsl(settings.light_mode_surface_active_color))
    } else if (settings.text_color) {
      // Default light surface active
      const lightSurfaceActive = createDarkerVariant(settings.text_color, 0.24)
      root.style.setProperty('--color-surface-active', hexToHsl(lightSurfaceActive))
    }

    // Set border colors for light mode
    if (settings.border_color) {
      root.style.setProperty('--color-border', hexToHsl(settings.border_color))
    } else if (settings.text_color) {
      const borderColor = createDarkerVariant(settings.text_color, 0.2)
      root.style.setProperty('--color-border', hexToHsl(borderColor))
    }

    if (settings.border_focus_color) {
      root.style.setProperty('--color-border-focus', hexToHsl(settings.border_focus_color))
    } else if (settings.primary_color) {
      // Default focus border is primary color
      root.style.setProperty('--color-border-focus', hexToHsl(settings.primary_color))
    }

    // Set static colors - these should be used regardless of theme
    if (settings.static_black_color && /^#[0-9A-F]{6}$/i.test(settings.static_black_color)) {
      root.style.setProperty('--color-static-black', hexToHsl(settings.static_black_color))
    } else {
      // Fallback to pure black
      root.style.setProperty('--color-static-black', '0 0% 0%') // HSL for black
    }

    if (settings.static_white_color && /^#[0-9A-F]{6}$/i.test(settings.static_white_color)) {
      root.style.setProperty('--color-static-white', hexToHsl(settings.static_white_color))
    } else {
      // Fallback to pure white
      root.style.setProperty('--color-static-white', '0 0% 100%') // HSL for white
    }

    // Set other status colors (success, warning, info) if they exist
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

  // Function to update the theme preference (no-op since we're always light)
  const handleSetTheme = () => {
    // Always light mode, no changes needed
  }

  // Create the context value with safe defaults for SSR
  const contextValue = {
    settings,
    // Always light mode
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

// Helper functions for color variants
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
    // Return original color if any error occurs
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
    // Return original color if any error occurs
    return hexColor;
  }
}
