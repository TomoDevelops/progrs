import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  decimal,
  date,
  index,
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
    totalVolume: decimal("total_volume", { precision: 10, scale: 2 }), // in lbs/kg
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
  weight: decimal("weight", { precision: 8, scale: 2 }), // lbs/kg
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
    bodyWeight: decimal("body_weight", { precision: 5, scale: 2 }), // in lbs/kg
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
