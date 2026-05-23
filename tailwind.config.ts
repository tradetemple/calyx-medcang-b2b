import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-noto-sans)', 'sans-serif'],
        heading: ['var(--font-heading)'],
        'lexend-exa': ['Lexend Exa', 'var(--font-noto-sans)', 'sans-serif'],
        'noto-sans': ['var(--font-noto-sans)', 'sans-serif'],
        'merriweather-main': ['var(--font-merriweather-main)', 'serif'],
        'montserrat': ['var(--font-montserrat)', 'sans-serif'],
      },
      typography: {
        invert: {
          css: {
            '--tw-prose-body': 'var(--tw-prose-invert-body)',
            '--tw-prose-headings': 'hsl(var(--color-text-main))',
            '--tw-prose-lead': 'var(--tw-prose-invert-lead)',
            '--tw-prose-links': 'var(--tw-prose-invert-links)',
            '--tw-prose-bold': 'var(--tw-prose-invert-bold)',
            '--tw-prose-counters': 'hsl(var(--color-text-main))',
            '--tw-prose-bullets': 'hsl(var(--color-text-main))',
            '--tw-prose-hr': 'var(--tw-prose-invert-hr)',
            '--tw-prose-quotes': 'var(--tw-prose-invert-quotes)',
            '--tw-prose-quote-borders': 'var(--tw-prose-invert-quote-borders)',
            '--tw-prose-captions': 'var(--tw-prose-invert-captions)',
            '--tw-prose-code': 'var(--tw-prose-invert-code)',
            '--tw-prose-pre-code': 'var(--tw-prose-invert-pre-code)',
            '--tw-prose-pre-bg': 'var(--tw-prose-invert-pre-bg)',
            '--tw-prose-th-borders': 'var(--tw-prose-invert-th-borders)',
            '--tw-prose-td-borders': 'var(--tw-prose-invert-td-borders)',
            // Define your color variables for inverted prose
            '--tw-prose-invert-body': '#e5e7eb', // Example color
            '--tw-prose-invert-headings': 'hsl(var(--color-text-main))',
            '--tw-prose-invert-lead': '#d1d5db',
            '--tw-prose-invert-links': '#818cf8',
            '--tw-prose-invert-bold': '#ffffff',
            '--tw-prose-invert-counters': 'hsl(var(--color-text-main))',
            '--tw-prose-invert-bullets': 'hsl(var(--color-text-main))',
            '--tw-prose-invert-hr': '#374151',
            '--tw-prose-invert-quotes': '#f3f4f6',
            '--tw-prose-invert-quote-borders': '#4b5563',
            '--tw-prose-invert-captions': '#6b7280',
            '--tw-prose-invert-code': '#f3f4f6',
            '--tw-prose-invert-pre-code': '#ffffff',
            '--tw-prose-invert-pre-bg': '#111827',
            '--tw-prose-invert-th-borders': '#4b5563',
            '--tw-prose-invert-td-borders': '#374151',
          },
        },
      },
      colors: {
        // Dynamic theme colors using CSS variables
        primary: {
          DEFAULT: 'hsl(var(--color-primary) / <alpha-value>)',
          light: 'hsl(var(--color-primary-light) / <alpha-value>)',
          dark: 'hsl(var(--color-primary-dark) / <alpha-value>)',
          gradient: {
            from: 'hsl(var(--color-primary-gradient-from) / <alpha-value>)',
            to: 'hsl(var(--color-primary-gradient-to) / <alpha-value>)',
          }
        },
        secondary: {
          DEFAULT: 'hsl(var(--color-secondary) / <alpha-value>)',
          light: 'hsl(var(--color-secondary-light) / <alpha-value>)',
          dark: 'hsl(var(--color-secondary-dark) / <alpha-value>)',
          gradient: {
            from: 'hsl(var(--color-secondary-gradient-from) / <alpha-value>)',
            to: 'hsl(var(--color-secondary-gradient-to) / <alpha-value>)',
          }
        },
        accent: {
          DEFAULT: 'hsl(var(--color-accent) / <alpha-value>)',
          light: 'hsl(var(--color-accent-light) / <alpha-value>)',
          dark: 'hsl(var(--color-accent-dark) / <alpha-value>)',
        },

        // Background colors
        'bg-main': {
          DEFAULT: 'hsl(var(--color-bg-main) / <alpha-value>)',
        },
        'bg-secondary': {
          DEFAULT: 'hsl(var(--color-bg-secondary) / <alpha-value>)',
        },

        // Text hierarchy colors
        'text-main': {
          DEFAULT: 'hsl(var(--color-text-main) / <alpha-value>)',
        },
        'text-secondary': {
          DEFAULT: 'hsl(var(--color-text-secondary) / <alpha-value>)',
        },

        // Static colors (always the same regardless of theme)
        'static': {
          'black': 'hsl(var(--color-static-black) / <alpha-value>)',
          'white': 'hsl(var(--color-static-white) / <alpha-value>)',
          'transparent': 'transparent',
        },

        // Status colors
        'status': {
          'error': {
            DEFAULT: 'hsl(var(--color-status-error) / <alpha-value>)',
            light: 'hsl(var(--color-status-error-light) / <alpha-value>)',
          },
          'success': {
            DEFAULT: 'hsl(var(--color-status-success) / <alpha-value>)',
            light: 'hsl(var(--color-status-success-light) / <alpha-value>)',
          },
          'warning': {
            DEFAULT: 'hsl(var(--color-status-warning) / <alpha-value>)',
            light: 'hsl(var(--color-status-warning-light) / <alpha-value>)',
          },
          'info': {
            DEFAULT: 'hsl(var(--color-status-info) / <alpha-value>)',
            light: 'hsl(var(--color-status-info-light) / <alpha-value>)',
          },
        },

        // Surface colors for cards, modals, etc.
        'surface': {
          DEFAULT: 'hsl(var(--color-surface) / <alpha-value>)',
          'hover': 'hsl(var(--color-surface-hover) / <alpha-value>)',
          'active': 'hsl(var(--color-surface-active) / <alpha-value>)',
        },

        // Border colors
        'border': {
          DEFAULT: 'hsl(var(--color-border) / <alpha-value>)',
          'focus': 'hsl(var(--color-border-focus) / <alpha-value>)',
        },
      },
      keyframes: {
        'gradient-x': {
          '0%, 100%': { 'background-position': '0% 50%' },
          '50%': { 'background-position': '100% 50%' },
        },
        'pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '.5' },
        },
        'platinum-edge-pulse': {
          '0%, 100%': { boxShadow: '0 0 12px 2px rgba(160, 100, 250, 0.4)' },
          '50%': { boxShadow: '0 0 24px 6px rgba(160, 100, 250, 0.6)' },
        },
        'active-rank-label-glow': {
          '0%, 100%': { filter: 'drop-shadow(0 0 2px currentColor)' },
          '50%': { filter: 'drop-shadow(0 0 5px currentColor)' },
        },
        'secondary-glow-kf': {
          '0%, 100%': { filter: 'drop-shadow(0 0 3px hsl(var(--color-secondary)))' },
          '50%': { filter: 'drop-shadow(0 0 6px hsl(var(--color-secondary)))' },
        },
        'border-spin': { // Renamed and simplified keyframes
          'to': { transform: 'rotate(360deg)' }
        },
        'gradient-x-slow': { // New keyframe for slower gradient animation
          '0%, 100%': { 'background-position': '0% 50%' },
          '50%': { 'background-position': '100% 50%' },
        },
        'platinum-rank-label-glow-kf': { // New keyframe for platinum rank label
          '0%, 100%': { filter: 'drop-shadow(0 0 2px hsl(var(--color-secondary))) drop-shadow(0 0 4px hsl(var(--color-secondary-gradient-from)))' },
          '50%': { filter: 'drop-shadow(0 0 5px hsl(var(--color-secondary))) drop-shadow(0 0 8px hsl(var(--color-secondary-gradient-to)))' },
        },
        'shimmer': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        }
      },
      animation: {
        'gradient-x': 'gradient-x 4s linear infinite',
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'platinum-edge-pulse': 'platinum-edge-pulse 2.5s infinite ease-in-out',
        'active-rank-label-glow': 'active-rank-label-glow 1.8s infinite ease-in-out',
        'animate-secondary-glow': 'secondary-glow-kf 2s infinite ease-in-out',
        'border-spin-anim': 'border-spin 10s linear infinite',
        'animate-gradient-x-slow': 'gradient-x-slow 16s ease-in-out infinite',
        'animate-platinum-rank-label-glow': 'platinum-rank-label-glow-kf 1.8s infinite ease-in-out', // New animation utility
        'shimmer': 'shimmer 2s infinite'
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography')
  ],
}
export default config