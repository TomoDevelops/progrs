import { z } from "zod";

// Enum schemas matching database enums
export const unitsSchema = z.enum(["metric", "imperial"]);
export const oneRmFormulaSchema = z.enum(["epley", "brzycki"]);
export const defaultWorkoutViewSchema = z.enum(["last", "empty", "list"]);
export const chartMetricSchema = z.enum([
  "total_volume",
  "one_rm",
  "duration",
  "body_weight",
]);
export const chartRangeSchema = z.enum(["2w", "8w", "6m", "1y"]);
export const heatmapMetricSchema = z.enum(["volume", "minutes"]);
export const themeSchema = z.enum(["system", "light", "dark"]);
export const timeFormatSchema = z.enum(["12h", "24h"]);
export const firstDaySchema = z.enum(["mon", "sun"]);
export const visibilitySchema = z.enum(["public", "followers", "private"]);

// User Settings schema
export const userSettingsSchema = z.object({
  units: unitsSchema.default("metric"),
  barWeight: z.number().min(0).max(100).default(20),
  platePairs: z.array(z.number().positive()).optional(),
  roundingIncrement: z.number().positive().default(2.5),
  oneRmFormula: oneRmFormulaSchema.default("epley"),
  restTimerEnabled: z.boolean().default(true),
  restTimerSeconds: z.number().int().min(30).max(600).default(120),
  autoProgressionEnabled: z.boolean().default(false),
  autoProgressionStep: z.number().positive().default(2.5),
  warmupPreset: z.string().default("40-60-75-90"),
  defaultWorkoutView: defaultWorkoutViewSchema.default("last"),
  quickStartDefaultSplit: z.string().optional(),
  
  chartDefaultMetric: chartMetricSchema.default("total_volume"),
  chartDefaultRange: chartRangeSchema.default("8w"),
  heatmapMetric: heatmapMetricSchema.default("volume"),
  showBodyWeightOverlay: z.boolean().default(false),
  firstDayOfWeek: firstDaySchema.default("mon"),
  timeFormat: timeFormatSchema.default("24h"),
  language: z.string().optional(),
  theme: themeSchema.default("system"),
  
  prToastsEnabled: z.boolean().default(true),
  showPrBadges: z.boolean().default(true),
  streakNudgesEnabled: z.boolean().default(true),
  profileVisibility: visibilitySchema.default("private"),
});

// Partial schema for updates
export const userSettingsUpdateSchema = userSettingsSchema.partial();

// Notification preferences schema
export const notificationPreferencesSchema = z.object({
  weeklySummaryEmail: z.boolean().default(false),
  workoutRemindersEmail: z.boolean().default(false),
  prEmail: z.boolean().default(false),
  productUpdatesEmail: z.boolean().default(false),
  pushWorkoutReminders: z.boolean().default(false),
  pushGoals: z.boolean().default(false),
});

// Partial schema for updates
export const notificationPreferencesUpdateSchema = notificationPreferencesSchema.partial();

// Workout reminder schema
export const workoutReminderSchema = z.object({
  id: z.string().optional(),
  dayOfWeek: z.number().int().min(0).max(6), // 0=Sun, 6=Sat
  timeLocal: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
  enabled: z.boolean().default(true),
});

// Create reminder schema (without id)
export const createWorkoutReminderSchema = workoutReminderSchema.omit({ id: true });

// Update reminder schema
export const updateWorkoutReminderSchema = workoutReminderSchema.partial().required({ id: true });

// Push subscription schema
export const pushSubscriptionSchema = z.object({
  endpoint: z.string().url(),
  p256dh: z.string(),
  auth: z.string(),
  userAgent: z.string().optional(),
});

// Profile update schema
export const profileUpdateSchema = z.object({
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores").optional(),
  bio: z.string().max(280).optional(),
  image: z.string().url().optional(),
});

// Data export schema
export const dataExportSchema = z.object({
  format: z.enum(["csv", "json"]).default("csv"),
});

// Exercise alias schema
export const exerciseAliasSchema = z.object({
  exerciseId: z.string(),
  alias: z.string().min(1).max(100),
});

// TypeScript types derived from schemas
export type Units = z.infer<typeof unitsSchema>;
export type OneRmFormula = z.infer<typeof oneRmFormulaSchema>;
export type DefaultWorkoutView = z.infer<typeof defaultWorkoutViewSchema>;
export type ChartMetric = z.infer<typeof chartMetricSchema>;
export type ChartRange = z.infer<typeof chartRangeSchema>;
export type HeatmapMetric = z.infer<typeof heatmapMetricSchema>;
export type Theme = z.infer<typeof themeSchema>;
export type TimeFormat = z.infer<typeof timeFormatSchema>;
export type FirstDay = z.infer<typeof firstDaySchema>;
export type Visibility = z.infer<typeof visibilitySchema>;

export type UserSettings = z.infer<typeof userSettingsSchema>;
export type UserSettingsUpdate = z.infer<typeof userSettingsUpdateSchema>;
export type NotificationPreferences = z.infer<typeof notificationPreferencesSchema>;
export type NotificationPreferencesUpdate = z.infer<typeof notificationPreferencesUpdateSchema>;
export type WorkoutReminder = z.infer<typeof workoutReminderSchema>;
export type CreateWorkoutReminder = z.infer<typeof createWorkoutReminderSchema>;
export type UpdateWorkoutReminder = z.infer<typeof updateWorkoutReminderSchema>;
export type PushSubscription = z.infer<typeof pushSubscriptionSchema>;
export type ProfileUpdate = z.infer<typeof profileUpdateSchema>;
export type DataExport = z.infer<typeof dataExportSchema>;
export type ExerciseAlias = z.infer<typeof exerciseAliasSchema>;

export interface ProfileUpdateData {
  name?: string;
  email?: string;
  username?: string;
}

export interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  username: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Settings section types for UI organization
export type SettingsSection = 
  | "profile"
  | "security"
  | "training"
  | "dashboard"
  | "notifications"
  | "privacy"
  | "appearance"
  | "language"
  | "shortcuts";

// Settings navigation item
export interface SettingsNavItem {
  id: SettingsSection;
  label: string;
  description: string;
  icon: string;
}

// API response types
export interface SettingsResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface DataExportJob {
  id: string;
  format: "csv" | "json";
  status: "pending" | "processing" | "complete" | "error";
  downloadUrl?: string;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

// Form state types
export interface SettingsFormState {
  isDirty: boolean;
  isSubmitting: boolean;
  errors: Record<string, string>;
}

// Settings context type
export interface SettingsContextType {
  settings: UserSettings;
  notifications: NotificationPreferences;
  reminders: WorkoutReminder[];
  updateSettings: (updates: UserSettingsUpdate) => Promise<void>;
  updateNotifications: (updates: NotificationPreferencesUpdate) => Promise<void>;
  createReminder: (reminder: CreateWorkoutReminder) => Promise<void>;
  updateReminder: (reminder: UpdateWorkoutReminder) => Promise<void>;
  deleteReminder: (id: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}