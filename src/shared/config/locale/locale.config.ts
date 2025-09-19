/**
 * Centralized locale configuration for internationalization support
 * Handles user preference detection, storage, and locale management
 */

import { Locale } from "date-fns";

// Supported locales configuration
export const SUPPORTED_LOCALES = {
  "en-US": {
    code: "en-US",
    name: "English (US)",
    dateFormat: "MM/dd/yyyy",
    timeFormat: "12h",
    firstDayOfWeek: 0, // Sunday
  },
  "en-GB": {
    code: "en-GB",
    name: "English (UK)",
    dateFormat: "dd/MM/yyyy",
    timeFormat: "24h",
    firstDayOfWeek: 1, // Monday
  },
  "ja-JP": {
    code: "ja-JP",
    name: "日本語",
    dateFormat: "yyyy/MM/dd",
    timeFormat: "24h",
    firstDayOfWeek: 0, // Sunday
  },
  "de-DE": {
    code: "de-DE",
    name: "Deutsch",
    dateFormat: "dd.MM.yyyy",
    timeFormat: "24h",
    firstDayOfWeek: 1, // Monday
  },
  "fr-FR": {
    code: "fr-FR",
    name: "Français",
    dateFormat: "dd/MM/yyyy",
    timeFormat: "24h",
    firstDayOfWeek: 1, // Monday
  },
  "es-ES": {
    code: "es-ES",
    name: "Español",
    dateFormat: "dd/MM/yyyy",
    timeFormat: "24h",
    firstDayOfWeek: 1, // Monday
  },
} as const;

export type SupportedLocaleCode = keyof typeof SUPPORTED_LOCALES;
export type LocaleConfig = (typeof SUPPORTED_LOCALES)[SupportedLocaleCode];

// Default locale
export const DEFAULT_LOCALE: SupportedLocaleCode = "en-US";

/**
 * Detects user's preferred locale from various sources
 * Priority: localStorage > navigator.language > default
 */
const LOCALE_STORAGE_KEY = "user-locale-preference";

export function detectUserLocale(): SupportedLocaleCode {
  // Client-only stored preference
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(
      LOCALE_STORAGE_KEY,
    ) as SupportedLocaleCode | null;
    if (stored && stored in SUPPORTED_LOCALES) return stored;
  }

  // Client-only browser language (guard that it's a string)
  if (typeof navigator !== "undefined") {
    const browserLang =
      typeof navigator.language === "string" ? navigator.language : "";

    if (browserLang && browserLang in SUPPORTED_LOCALES) {
      return browserLang as SupportedLocaleCode;
    }

    const langCode = browserLang ? browserLang.split("-")[0] : "";
    const matchingLocale = (
      Object.keys(SUPPORTED_LOCALES) as SupportedLocaleCode[]
    ).find((locale) => langCode && locale.startsWith(langCode));

    if (matchingLocale) return matchingLocale;
  }

  return DEFAULT_LOCALE;
}

/**
 * Stores user's locale preference
 */
export function storeUserLocale(locale: SupportedLocaleCode): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  }
}

/**
 * Gets locale configuration for a given locale code
 */
export function getLocaleConfig(locale: SupportedLocaleCode): LocaleConfig {
  return SUPPORTED_LOCALES[locale];
}

/**
 * Gets the first day of week for a locale (0 = Sunday, 1 = Monday, etc.)
 */
export function getFirstDayOfWeek(locale: SupportedLocaleCode): number {
  return SUPPORTED_LOCALES[locale].firstDayOfWeek;
}

/**
 * Gets the date format pattern for a locale
 */
export function getDateFormat(locale: SupportedLocaleCode): string {
  return SUPPORTED_LOCALES[locale].dateFormat;
}

/**
 * Gets the time format preference for a locale
 */
export function getTimeFormat(locale: SupportedLocaleCode): "12h" | "24h" {
  return SUPPORTED_LOCALES[locale].timeFormat;
}

/**
 * Validates if a locale code is supported
 */
export function isSupportedLocale(
  locale: string,
): locale is SupportedLocaleCode {
  return locale in SUPPORTED_LOCALES;
}

/**
 * Gets all supported locales as an array
 */
export function getAllSupportedLocales(): LocaleConfig[] {
  return Object.values(SUPPORTED_LOCALES);
}

/**
 * Dynamic import for date-fns locale
 * This allows for code splitting and only loading needed locales
 */
export async function getDateFnsLocale(
  locale: SupportedLocaleCode,
): Promise<Locale> {
  try {
    switch (locale) {
      case "en-US":
        const { enUS } = await import("date-fns/locale/en-US");
        return enUS;
      case "en-GB":
        const { enGB } = await import("date-fns/locale/en-GB");
        return enGB;
      case "ja-JP":
        const { ja } = await import("date-fns/locale/ja");
        return ja;
      case "de-DE":
        const { de } = await import("date-fns/locale/de");
        return de;
      case "fr-FR":
        const { fr } = await import("date-fns/locale/fr");
        return fr;
      case "es-ES":
        const { es } = await import("date-fns/locale/es");
        return es;
      default:
        // Fallback to en-US
        const { enUS: fallback } = await import("date-fns/locale/en-US");
        return fallback;
    }
  } catch (error) {
    console.warn(
      `Failed to load locale ${locale}, falling back to en-US:`,
      error,
    );
    const { enUS } = await import("date-fns/locale/en-US");
    return enUS;
  }
}

/**
 * Gets locale-specific number formatting options
 */
export function getNumberFormatOptions(): Intl.NumberFormatOptions {
  // TODO: Add locale-specific number formatting preferences
  // Currently using default formatting for all locales
  return {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  };
}

/**
 * Format number according to locale
 */
export function formatNumber(
  value: number,
  localeCode: SupportedLocaleCode,
): string {
  return new Intl.NumberFormat(localeCode, getNumberFormatOptions()).format(
    value,
  );
}

/**
 * Gets locale-specific currency formatting options
 */
export function getCurrencyFormatOptions(
  localeCode: SupportedLocaleCode,
  currency: string = "USD",
): Intl.NumberFormatOptions {
  return {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  };
}
