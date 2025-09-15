/**
 * RTL Script component that handles locale detection and RTL setup
 * without forcing the entire app to be client-side rendered.
 * This runs as an inline script in the document head.
 */
export function RTLScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            // Get stored locale preference or detect from browser
            function getStoredLocale() {
              try {
                return localStorage.getItem('locale') || navigator.language || 'en';
              } catch {
                return 'en';
              }
            }

            // Check if locale is RTL
            function isRTLLocale(locale) {
              const rtlLocales = ['ar', 'he', 'fa', 'ur', 'ku', 'dv'];
              return rtlLocales.some(rtl => locale.toLowerCase().startsWith(rtl));
            }

            // Set HTML attributes and CSS classes
            function setupRTL() {
              const locale = getStoredLocale();
              const isRTL = isRTLLocale(locale);
              const html = document.documentElement;
              
              // Set language and direction
              html.setAttribute('lang', locale);
              html.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
              
              // Set CSS classes
              html.classList.remove('rtl', 'ltr');
              html.classList.add(isRTL ? 'rtl' : 'ltr');
              
              // Set locale class for specific styling
              html.classList.forEach(cls => {
                if (cls.startsWith('locale-')) {
                  html.classList.remove(cls);
                }
              });
              html.classList.add('locale-' + locale);
            }

            // Run immediately
            if (document.readyState === 'loading') {
              document.addEventListener('DOMContentLoaded', setupRTL);
            } else {
              setupRTL();
            }
          })();
        `,
      }}
    />
  );
}