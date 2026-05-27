import Script from 'next/script'

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

export function ThemeInitializer() {
  const scriptContent = getThemeScriptContent();

  return (
    <Script 
      id="theme-initializer" 
      strategy="lazyOnload"
      dangerouslySetInnerHTML={{ __html: scriptContent }} 
    />
  );
}
