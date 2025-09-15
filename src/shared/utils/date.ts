/**
 * Utility functions for timezone-aware date handling
 * All dates are stored in UTC in the database and converted for display
 */

/**
 * Get today's date in UTC as YYYY-MM-DD format
 * This ensures consistent date comparison regardless of server timezone
 */
export function getTodayUTC(): string {
  const now = new Date();
  const utcDate = new Date(now.getTime() + now.getTimezoneOffset() * 60000);
  return utcDate.toISOString().split('T')[0];
}

/**
 * Get a date in UTC as YYYY-MM-DD format
 * @param date - The date to convert
 */
export function toUTCDateString(date: Date): string {
  const utcDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
  return utcDate.toISOString().split('T')[0];
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
 * Format date for display in user's locale
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