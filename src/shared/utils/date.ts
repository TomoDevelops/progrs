/**
 * Utility functions for timezone-aware and locale-aware date handling
 * All dates are stored in UTC in the database and converted for display
 * Enhanced with internationalization support for multiple locales
 */

import { format as dateFnsFormat, Locale } from "date-fns";
import {
  SupportedLocaleCode,
  getDateFnsLocale,
  getDateFormat,
} from "@/shared/config/locale/locale.config";

/**
 * Get today's date as YYYY-MM-DD format in user's timezone
 * This ensures consistent date comparison for date-only operations
 * @param userTimezone - User's timezone (defaults to system timezone)
 */
export function getTodayInTimezone(userTimezone?: string): string {
  const now = new Date();
  const timezone = userTimezone || getUserTimezone();
  
  // Convert to user's timezone and get date string
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  
  return formatter.format(now);
}







/**
 * Get date range for consistency data in UTC
 * @param days - Number of days to go back
 */
export function getUTCDateRange(days: number): {
  startDate: Date;
  endDate: Date;
} {
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
  locale: string = "en-US",
  options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  },
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
  locale?: Locale,
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
  dateFnsLocale?: Locale,
): Promise<string> {
  const locale = dateFnsLocale || (await getDateFnsLocale(localeCode));
  const formatPattern = getDateFormat(localeCode);

  // Convert common format patterns to date-fns format
  const dateFnsPattern = formatPattern
    .replace(/yyyy/g, "yyyy")
    .replace(/MM/g, "MM")
    .replace(/dd/g, "dd");

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
    style?: "full" | "long" | "medium" | "short";
    includeTime?: boolean;
    locale?: string;
  } = {},
): string {
  const { style = "medium", includeTime = false, locale } = options;

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
  locale: string = "en-US",
): string {
  const diffInSeconds = Math.floor(
    (date.getTime() - baseDate.getTime()) / 1000,
  );

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  const intervals = [
    { unit: "year" as const, seconds: 31536000 },
    { unit: "month" as const, seconds: 2592000 },
    { unit: "day" as const, seconds: 86400 },
    { unit: "hour" as const, seconds: 3600 },
    { unit: "minute" as const, seconds: 60 },
    { unit: "second" as const, seconds: 1 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(Math.abs(diffInSeconds) / interval.seconds);
    if (count >= 1) {
      return rtf.format(diffInSeconds < 0 ? -count : count, interval.unit);
    }
  }

  return rtf.format(0, "second");
}

/**
 * Get user's timezone
 */
export function getUserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}





/**
 * Check if a date string represents today in user's timezone
 * @param dateString - Date string in YYYY-MM-DD format
 * @param userTimezone - User's timezone (defaults to system timezone)
 */
export function isToday(dateString: string, userTimezone?: string): boolean {
  const today = getTodayInTimezone(userTimezone);
  return dateString === today;
}

/**
 * Check if a workout session was completed today in user's timezone
 * @param completedAt - Date when workout was completed
 * @param userTimezone - User's timezone (defaults to system timezone)
 */
export function isCompletedToday(completedAt: Date, userTimezone?: string): boolean {
  const timezone = userTimezone || getUserTimezone();
  
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  
  const completedDate = formatter.format(completedAt);
  const today = getTodayInTimezone(timezone);
  
  return completedDate === today;
}

/**
 * Convert a Date object to a local date string in the user's timezone
 * @param date - The date to convert
 * @param userTimezone - The user's timezone (optional, defaults to system timezone)
 * @returns Date string in YYYY-MM-DD format in the user's timezone
 */
export function toLocalDateString(date: Date, userTimezone?: string): string {
  const timezone = userTimezone || getUserTimezone();
  
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  
  return formatter.format(date);
}
