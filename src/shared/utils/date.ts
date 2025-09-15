/**
 * Utility functions for timezone-aware and locale-aware date handling
 * All dates are stored in UTC in the database and converted for display
 * Enhanced with internationalization support for multiple locales
 */

import { format as dateFnsFormat, Locale } from 'date-fns';
import { SupportedLocaleCode, getDateFnsLocale, getDateFormat } from '@/shared/config/locale/locale.config';

/**
 * Get today's date as YYYY-MM-DD format
 * This ensures consistent date comparison for date-only operations
 */
export function getTodayUTC(): string {
  const now = new Date();
  // For date-only comparisons, use local date without timezone conversion
  return now.toISOString().split('T')[0];
}

/**
 * Get a date as YYYY-MM-DD format
 * @param date - The date to convert
 */
export function toUTCDateString(date: Date): string {
  // For date-only comparisons, use the date without timezone conversion
  return date.toISOString().split('T')[0];
}

/**
 * Convert a UTC date string to a Date object in user's timezone
 * @param dateString - UTC date string in YYYY-MM-DD format
 */
export function fromUTCDateString(dateString: string): Date {
  return new Date(dateString + 'T00:00:00.000Z');
}

/**
 * Get date range for consistency data in UTC
 * @param days - Number of days to go back
 */
export function getUTCDateRange(days: number): { startDate: Date; endDate: Date } {
  const now = new Date();
  const utcNow = new Date(now.getTime() + now.getTimezoneOffset() * 60000);
  
  const endDate = new Date(utcNow);
  endDate.setUTCHours(23, 59, 59, 999); // End of day in UTC
  
  const startDate = new Date(utcNow);
  startDate.setUTCDate(startDate.getUTCDate() - days + 1);
  startDate.setUTCHours(0, 0, 0, 0); // Start of day in UTC
  
  return { startDate, endDate };
}

/**
 * Format date for display in user's locale using Intl.DateTimeFormat
 * @param date - Date to format
 * @param locale - User's locale (defaults to 'en-US')
 * @param options - Intl.DateTimeFormatOptions
 */
export function formatDateForLocale(
  date: Date,
  locale: string = 'en-US',
  options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }
): string {
  return new Intl.DateTimeFormat(locale, options).format(date);
}

/**
 * Format date using date-fns with locale support
 * @param date - Date to format
 * @param formatStr - Format string (date-fns format)
 * @param locale - date-fns Locale object
 */
export function formatDateWithLocale(
  date: Date,
  formatStr: string,
  locale?: Locale
): string {
  return dateFnsFormat(date, formatStr, { locale });
}

/**
 * Format date using locale-specific date format pattern
 * @param date - Date to format
 * @param localeCode - Supported locale code
 * @param dateFnsLocale - Optional date-fns locale object
 */
export async function formatDateForLocaleCode(
  date: Date,
  localeCode: SupportedLocaleCode,
  dateFnsLocale?: Locale
): Promise<string> {
  const locale = dateFnsLocale || await getDateFnsLocale(localeCode);
  const formatPattern = getDateFormat(localeCode);
  
  // Convert common format patterns to date-fns format
  const dateFnsPattern = formatPattern
    .replace(/yyyy/g, 'yyyy')
    .replace(/MM/g, 'MM')
    .replace(/dd/g, 'dd');
  
  return dateFnsFormat(date, dateFnsPattern, { locale });
}

/**
 * Format date for display with automatic locale detection
 * @param date - Date to format
 * @param options - Formatting options
 */
export function formatDateAuto(
  date: Date,
  options: {
    style?: 'full' | 'long' | 'medium' | 'short';
    includeTime?: boolean;
    locale?: string;
  } = {}
): string {
  const { style = 'medium', includeTime = false, locale } = options;
  
  const formatOptions: Intl.DateTimeFormatOptions = {
    dateStyle: style,
  };
  
  if (includeTime) {
    formatOptions.timeStyle = style;
  }
  
  return new Intl.DateTimeFormat(locale, formatOptions).format(date);
}

/**
 * Format relative time (e.g., "2 days ago", "in 3 hours")
 * @param date - Date to format
 * @param baseDate - Base date to compare against (defaults to now)
 * @param locale - Locale for formatting
 */
export function formatRelativeTime(
  date: Date,
  baseDate: Date = new Date(),
  locale: string = 'en-US'
): string {
  const diffInSeconds = Math.floor((date.getTime() - baseDate.getTime()) / 1000);
  
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  
  const intervals = [
    { unit: 'year' as const, seconds: 31536000 },
    { unit: 'month' as const, seconds: 2592000 },
    { unit: 'day' as const, seconds: 86400 },
    { unit: 'hour' as const, seconds: 3600 },
    { unit: 'minute' as const, seconds: 60 },
    { unit: 'second' as const, seconds: 1 },
  ];
  
  for (const interval of intervals) {
    const count = Math.floor(Math.abs(diffInSeconds) / interval.seconds);
    if (count >= 1) {
      return rtf.format(diffInSeconds < 0 ? -count : count, interval.unit);
    }
  }
  
  return rtf.format(0, 'second');
}

/**
 * Get user's timezone
 */
export function getUserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/**
 * Convert UTC date to user's local date for display
 * @param utcDateString - UTC date string in YYYY-MM-DD format
 */
export function utcToLocalDate(utcDateString: string): Date {
  // Create date in UTC and convert to local timezone
  const utcDate = new Date(utcDateString + 'T00:00:00.000Z');
  return new Date(utcDate.getTime() - utcDate.getTimezoneOffset() * 60000);
}

/**
 * Get today's date in user's local timezone as YYYY-MM-DD
 * This is useful for display purposes only
 */
export function getTodayLocal(): string {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

/**
 * Check if a UTC date string represents today in user's timezone
 * @param utcDateString - UTC date string in YYYY-MM-DD format
 */
export function isToday(utcDateString: string): boolean {
  const today = getTodayLocal();
  const localDate = utcToLocalDate(utcDateString);
  return localDate.toISOString().split('T')[0] === today;
}