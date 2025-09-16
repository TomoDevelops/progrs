"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { Locale } from "date-fns";
import {
  SupportedLocaleCode,
  LocaleConfig,
  detectUserLocale,
  storeUserLocale,
  getLocaleConfig,
  getDateFnsLocale,
  isRTLLocale,
  getFirstDayOfWeek,
  getDateFormat,
  getTimeFormat,
} from "@/shared/config/locale/locale.config";

interface LocaleContextValue {
  // Current locale state
  locale: SupportedLocaleCode;
  localeConfig: LocaleConfig;
  dateFnsLocale: Locale | null;

  // Locale management
  setLocale: (locale: SupportedLocaleCode) => void;

  // Convenience getters
  isRTL: boolean;
  firstDayOfWeek: number;
  dateFormat: string;
  timeFormat: "12h" | "24h";

  // Loading state
  isLoading: boolean;
}

const LocaleContext = createContext<LocaleContextValue | undefined>(undefined);

interface LocaleProviderProps {
  children: ReactNode;
  defaultLocale?: SupportedLocaleCode;
}

export function LocaleProvider({
  children,
  defaultLocale,
}: LocaleProviderProps) {
  const [locale, setLocaleState] = useState<SupportedLocaleCode>(
    defaultLocale || detectUserLocale(),
  );
  const [dateFnsLocale, setDateFnsLocale] = useState<Locale | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const localeConfig = getLocaleConfig(locale);

  // Load date-fns locale when locale changes
  useEffect(() => {
    let isCancelled = false;

    const loadDateFnsLocale = async () => {
      setIsLoading(true);
      try {
        const dateFnsLoc = await getDateFnsLocale(locale);
        if (!isCancelled) {
          setDateFnsLocale(dateFnsLoc);
        }
      } catch (error) {
        console.error("Failed to load date-fns locale:", error);
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    loadDateFnsLocale();

    return () => {
      isCancelled = true;
    };
  }, [locale]);

  // Note: DOM updates are handled by LocaleSync component to avoid duplication

  const setLocale = (newLocale: SupportedLocaleCode) => {
    setLocaleState(newLocale);
    storeUserLocale(newLocale);
  };

  const contextValue: LocaleContextValue = {
    locale,
    localeConfig,
    dateFnsLocale,
    setLocale,
    isRTL: isRTLLocale(locale),
    firstDayOfWeek: getFirstDayOfWeek(locale),
    dateFormat: getDateFormat(locale),
    timeFormat: getTimeFormat(locale),
    isLoading,
  };

  return (
    <LocaleContext.Provider value={contextValue}>
      {children}
    </LocaleContext.Provider>
  );
}

/**
 * Hook to access locale context
 * Throws an error if used outside of LocaleProvider
 */
export function useLocale(): LocaleContextValue {
  const context = useContext(LocaleContext);
  if (context === undefined) {
    throw new Error("useLocale must be used within a LocaleProvider");
  }
  return context;
}

/**
 * Hook to get locale-aware formatters
 */
export function useLocaleFormatters() {
  const { locale } = useLocale();

  const formatNumber = (value: number, options?: Intl.NumberFormatOptions) => {
    return new Intl.NumberFormat(locale, options).format(value);
  };

  const formatCurrency = (
    value: number,
    currency: string = "USD",
    options?: Intl.NumberFormatOptions,
  ) => {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      ...options,
    }).format(value);
  };

  const formatDate = (date: Date, options?: Intl.DateTimeFormatOptions) => {
    return new Intl.DateTimeFormat(locale, options).format(date);
  };

  const formatRelativeTime = (
    value: number,
    unit: Intl.RelativeTimeFormatUnit,
    options?: Intl.RelativeTimeFormatOptions,
  ) => {
    return new Intl.RelativeTimeFormat(locale, options).format(value, unit);
  };

  return {
    formatNumber,
    formatCurrency,
    formatDate,
    formatRelativeTime,
  };
}

/**
 * Hook for locale-aware date operations
 */
export function useLocaleDateOperations() {
  const { dateFnsLocale, firstDayOfWeek, dateFormat, isLoading } = useLocale();

  return {
    dateFnsLocale,
    firstDayOfWeek,
    dateFormat,
    isLoading,
  };
}

/**
 * Higher-order component to provide locale context
 */
export function withLocale<P extends object>(
  Component: React.ComponentType<P>,
) {
  return function LocaleWrappedComponent(props: P) {
    return (
      <LocaleProvider>
        <Component {...props} />
      </LocaleProvider>
    );
  };
}
