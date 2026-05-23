import Script from 'next/script'
// import { SiteSettings } from '@/types/database' // Removed unused import

// Function to generate the IIFE script content - prevents hydration mismatches
function getThemeScriptContent() {
  return `
    (function () {
      try {
        var pref = localStorage.getItem('themePreference') || 'system';
        var isDark = pref === 'dark' || (pref === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
        document.documentElement.classList.toggle('dark', isDark);
      } catch (_) {}
    })();
  `;
}

// Component to render the script tag
export function ThemeInitializer() {
  const scriptContent = getThemeScriptContent();

  return (
    <Script 
      id="theme-initializer" 
      strategy="lazyOnload" // Run before React hydrates
      dangerouslySetInnerHTML={{ __html: scriptContent }} 
    />
  );
}
