import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  decimal,
  date,
  index,
  pgEnum,
  time,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

// Workout Routines
export const workoutRoutines = pgTable("workout_routines", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  estimatedDuration: integer("estimated_duration"), // in minutes
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// Routine Schedule
export const routineSchedule = pgTable(
  "routine_schedule",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    routineId: text("routine_id")
      .notNull()
      .references(() => workoutRoutines.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    scheduledDate: date("scheduled_date").notNull(),
    completed: boolean("completed").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    userDateIdx: index("idx_schedule_user_date").on(
      table.userId,
      table.scheduledDate,
    ),
  }),
);

// Workout Sessions
export const workoutSessions = pgTable(
  "workout_sessions",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    routineId: text("routine_id").references(() => workoutRoutines.id, {
      onDelete: "set null",
    }),
    name: text("name").notNull(),
    startedAt: timestamp("started_at").defaultNow().notNull(),
    endedAt: timestamp("ended_at"),
    totalDuration: integer("total_duration"), // in minutes (calculated)
    totalVolume: decimal("total_volume", { precision: 10, scale: 2 }), // in kg
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    userDateIdx: index("idx_sessions_user_date").on(
      table.userId,
      table.startedAt,
    ),
  }),
);

// Exercises
export const exercises = pgTable("exercises", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  muscleGroup: text("muscle_group"),
  equipment: text("equipment"),
  isPublic: boolean("is_public").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Routine Exercises (for workout routine templates)
export const routineExercises = pgTable("routine_exercises", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  routineId: text("routine_id")
    .notNull()
    .references(() => workoutRoutines.id, { onDelete: "cascade" }),
  exerciseId: text("exercise_id")
    .notNull()
    .references(() => exercises.id, { onDelete: "cascade" }),
  orderIndex: integer("order_index").notNull(),
  sets: integer("sets").notNull(),
  minReps: integer("min_reps"),
  maxReps: integer("max_reps"),
  targetWeight: decimal("target_weight", { precision: 8, scale: 2 }),
  restTime: integer("rest_time"), // in seconds
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Session Exercises
export const sessionExercises = pgTable("session_exercises", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  sessionId: text("session_id")
    .notNull()
    .references(() => workoutSessions.id, { onDelete: "cascade" }),
  exerciseId: text("exercise_id").references(() => exercises.id),
  name: text("name").notNull(), // denormalized for history
  orderIndex: integer("order_index").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Exercise Sets
export const exerciseSets = pgTable("exercise_sets", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  sessionExerciseId: text("session_exercise_id")
    .notNull()
    .references(() => sessionExercises.id, { onDelete: "cascade" }),
  setNumber: integer("set_number").notNull(),
  weight: decimal("weight", { precision: 8, scale: 2 }), // kg
  reps: integer("reps").notNull(),
  isPr: boolean("is_pr").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Personal Records (PRs)
export const personalRecords = pgTable(
  "personal_records",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    exerciseId: text("exercise_id").references(() => exercises.id),
    exerciseName: text("exercise_name").notNull(),
    maxWeight: decimal("max_weight", { precision: 8, scale: 2 }),
    maxReps: integer("max_reps"),
    achievedAt: timestamp("achieved_at").notNull(),
    sessionId: text("session_id").references(() => workoutSessions.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    userExerciseIdx: index("idx_prs_user_exercise").on(
      table.userId,
      table.exerciseId,
    ),
  }),
);

// User Goals
export const userGoals = pgTable(
  "user_goals",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    goalType: text("goal_type").notNull(), // 'workout', 'minutes', 'steps'
    targetValue: integer("target_value").notNull(),
    currentValue: integer("current_value").default(0).notNull(),
    period: text("period").default("daily").notNull(), // daily, weekly, monthly
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    userPeriodIdx: index("idx_goals_user_period").on(
      table.userId,
      table.period,
    ),
  }),
);

// Body Metrics
export const bodyMetrics = pgTable(
  "body_metrics",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    bodyWeight: decimal("body_weight", { precision: 5, scale: 2 }), // in kg
    recordedAt: timestamp("recorded_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    userDateIdx: index("idx_metrics_user_date").on(
      table.userId,
      table.recordedAt,
    ),
  }),
);

// Settings-related enums
export const defaultWorkoutViewEnum = pgEnum("default_workout_view", [
  "last",
  "empty",
  "list",
]);
export const chartMetricEnum = pgEnum("chart_metric", [
  "total_volume",
  "one_rm",
  "duration",
  "body_weight",
]);
export const chartRangeEnum = pgEnum("chart_range", ["2w", "8w", "6m", "1y"]);
export const heatmapMetricEnum = pgEnum("heatmap_metric", [
  "volume",
  "minutes",
]);
export const themeEnum = pgEnum("theme", ["system", "light", "dark"]);
export const timeFormatEnum = pgEnum("time_format", ["12h", "24h"]);
export const firstDayEnum = pgEnum("first_day_of_week", ["mon", "sun"]);
export const visibilityEnum = pgEnum("profile_visibility", [
  "public",
  "followers",
  "private",
]);

// One row per user — core preferences
export const userSettings = pgTable("user_settings", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  restTimerEnabled: boolean("rest_timer_enabled").default(true).notNull(),
  restTimerSeconds: integer("rest_timer_seconds").default(120).notNull(),
  defaultWorkoutView: defaultWorkoutViewEnum("default_workout_view")
    .default("last")
    .notNull(),
  quickStartDefaultSplit: text("quick_start_default_split"), // push|pull|legs|full

  chartDefaultMetric: chartMetricEnum("chart_default_metric")
    .default("total_volume")
    .notNull(),
  chartDefaultRange: chartRangeEnum("chart_default_range")
    .default("8w")
    .notNull(),
  heatmapMetric: heatmapMetricEnum("heatmap_metric")
    .default("volume")
    .notNull(),
  showBodyWeightOverlay: boolean("show_body_weight_overlay")
    .default(false)
    .notNull(),
  firstDayOfWeek: firstDayEnum("first_day_of_week").default("mon").notNull(),
  timeFormat: timeFormatEnum("time_format").default("24h").notNull(),
  language: text("language"),
  theme: themeEnum("theme").default("system").notNull(),

  prToastsEnabled: boolean("pr_toasts_enabled").default(true).notNull(),
  showPrBadges: boolean("show_pr_badges").default(true).notNull(),
  streakNudgesEnabled: boolean("streak_nudges_enabled").default(true).notNull(),
  profileVisibility: visibilityEnum("profile_visibility")
    .default("private")
    .notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// Email/Push notification toggles
export const notificationPreferences = pgTable("notification_preferences", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  weeklySummaryEmail: boolean("weekly_summary_email").default(false).notNull(),
  workoutRemindersEmail: boolean("workout_reminders_email")
    .default(false)
    .notNull(),
  prEmail: boolean("pr_email").default(false).notNull(),
  productUpdatesEmail: boolean("product_updates_email")
    .default(false)
    .notNull(),
  pushWorkoutReminders: boolean("push_workout_reminders")
    .default(false)
    .notNull(),
  pushGoals: boolean("push_goals").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// Workout reminder rules (local time)
export const workoutReminders = pgTable(
  "workout_reminders",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    dayOfWeek: integer("day_of_week").notNull(), // 0=Sun .. 6=Sat
    timeLocal: time("time_local").notNull(),
    enabled: boolean("enabled").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    uniqUserDowTime: uniqueIndex("uniq_reminder_user_dow_time").on(
      table.userId,
      table.dayOfWeek,
      table.timeLocal,
    ),
  }),
);

// Web push subscriptions (per device)
export const pushSubscriptions = pgTable(
  "push_subscriptions",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    endpoint: text("endpoint").notNull(),
    p256dh: text("p256dh").notNull(),
    auth: text("auth").notNull(),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    uniqPushEndpoint: uniqueIndex("uniq_push_user_endpoint").on(
      table.userId,
      table.endpoint,
    ),
  }),
);

// Per-user custom display names for exercises
export const exerciseAliases = pgTable(
  "exercise_aliases",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    exerciseId: text("exercise_id")
      .notNull()
      .references(() => exercises.id, { onDelete: "cascade" }),
    alias: text("alias").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    uniqUserExercise: uniqueIndex("uniq_alias_user_exercise").on(
      table.userId,
      table.exerciseId,
    ),
  }),
);

// Data export jobs (async)
export const dataExports = pgTable(
  "data_exports",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    format: text("format").default("csv").notNull(), // csv|json
    status: text("status").default("pending").notNull(), // pending|processing|complete|error
    downloadUrl: text("download_url"),
    error: text("error"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    userStatusIdx: index("idx_export_user_status").on(
      table.userId,
      table.status,
    ),
  }),
);

// Rate Limiting Tables
export const rateLimits = pgTable(
  "rate_limits",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    identifier: text("identifier").notNull(), // IP address or user ID
    action: text("action").notNull(), // e.g., 'generate-workout'
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    identifierActionIdx: index("idx_rate_limit_identifier_action").on(
      table.identifier,
      table.action,
    ),
    createdAtIdx: index("idx_rate_limit_created_at").on(table.createdAt),
  }),
);

// AI Workout Generation Tables
export const aiWorkoutBlueprints = pgTable(
  "ai_workout_blueprints",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    specHash: text("spec_hash").notNull().unique(),
    routineData: text("routine_data").notNull(), // JSON string of the routine
    createdAt: timestamp("created_at").defaultNow().notNull(),
    lastUsedAt: timestamp("last_used_at").defaultNow().notNull(),
    usageCount: integer("usage_count").default(1).notNull(),
  },
  (table) => ({
    specHashIdx: index("idx_blueprint_spec_hash").on(table.specHash),
    lastUsedIdx: index("idx_blueprint_last_used").on(table.lastUsedAt),
  }),
);

export const aiGenerationRequests = pgTable(
  "ai_generation_requests",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    specHash: text("spec_hash").notNull(),
    blueprintId: text("blueprint_id").references(() => aiWorkoutBlueprints.id, {
      onDelete: "set null",
    }),
    requestData: text("request_data").notNull(), // JSON string of the original request
    idempotencyKey: text("idempotency_key").unique(),
    result: text("result"), // JSON string of the generated workout
    status: text("status").default("pending").notNull(), // pending|processing|completed|failed
    error: text("error"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    completedAt: timestamp("completed_at"),
  },
  (table) => ({
    userDateIdx: index("idx_ai_request_user_date").on(
      table.userId,
      table.createdAt,
    ),
    statusIdx: index("idx_ai_request_status").on(table.status),
  }),
);

export const aiExerciseAliases = pgTable(
  "ai_exercise_aliases",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    aiName: text("ai_name").notNull(),
    canonicalExerciseId: text("canonical_exercise_id")
      .notNull()
      .references(() => exercises.id, { onDelete: "cascade" }),
    confidence: decimal("confidence", { precision: 3, scale: 2 }).notNull(), // 0.00-1.00
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    aiNameIdx: index("idx_ai_alias_name").on(table.aiName),
    exerciseIdx: index("idx_ai_alias_exercise").on(table.canonicalExerciseId),
  }),
);
