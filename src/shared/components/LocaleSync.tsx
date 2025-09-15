'use client';

import { useEffect } from 'react';
import { useLocale } from '@/shared/providers/LocaleProvider';

/**
 * Client-side component that syncs locale changes with HTML attributes
 * This only runs on the client and doesn't affect SSR
 */
export function LocaleSync() {
  const { isRTL, locale } = useLocale();

  useEffect(() => {
    // Only update if different from current state to avoid unnecessary DOM manipulation
    if (document.documentElement.lang !== locale) {
      document.documentElement.lang = locale;
    }
    
    const currentDir = document.documentElement.dir;
    const expectedDir = isRTL ? 'rtl' : 'ltr';
    
    if (currentDir !== expectedDir) {
      document.documentElement.dir = expectedDir;
    }
    
    // Update RTL class
    const hasRTLClass = document.documentElement.classList.contains('rtl');
    
    if (isRTL && !hasRTLClass) {
      document.documentElement.classList.add('rtl');
    } else if (!isRTL && hasRTLClass) {
      document.documentElement.classList.remove('rtl');
    }
  }, [isRTL, locale]);

  // This component doesn't render anything visible
  return null;
}