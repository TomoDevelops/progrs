import {
  dashboardRepository,
  type TodayWorkoutData,
  type WorkoutHistoryItem,
  type ConsistencyData,
  type TrendingMetric,
  type SummaryStats,
} from "@/app/api/dashboard/repository/dashboard.repository";


export interface DashboardOverview {
  todayWorkout: TodayWorkoutData | null;
  recentHistory: WorkoutHistoryItem[];
  weeklyConsistency: ConsistencyData[];
  trendingMetrics: TrendingMetric[];
  summaryStats: SummaryStats;
}

export class DashboardService {
  async getTodayWorkout(userId: string): Promise<TodayWorkoutData | null> {
    try {
      return await dashboardRepository.getTodayPlannedWorkout(userId);
    } catch (error) {
      console.error("Error fetching today workout:", error);
      throw new Error("Failed to fetch today's workout");
    }
  }

  async getTodayWorkouts(userId: string, userTimezone?: string): Promise<TodayWorkoutData[]> {
    try {
      return await dashboardRepository.getTodayPlannedWorkouts(userId, userTimezone);
    } catch (error) {
      console.error("Error fetching today workouts:", error);
      throw new Error("Failed to fetch today's workouts");
    }
  }

  async getWorkoutHistory(
    userId: string,
    limit: number = 10,
    offset: number = 0,
  ): Promise<WorkoutHistoryItem[]> {
    try {
      // Validate parameters
      if (limit < 1 || limit > 50) {
        throw new Error("Limit must be between 1 and 50");
      }
      if (offset < 0) {
        throw new Error("Offset must be non-negative");
      }

      return await dashboardRepository.getWorkoutHistory(userId, limit, offset);
    } catch (error) {
      console.error("Error fetching workout history:", error);
      if (error instanceof Error && error.message.includes("must be")) {
        throw error; // Re-throw validation errors
      }
      throw new Error("Failed to fetch workout history");
    }
  }

  async getConsistencyData(
    userId: string,
    days: number = 30,
  ): Promise<ConsistencyData[]> {
    try {
      // Validate parameters
      if (days < 1 || days > 365) {
        throw new Error("Days must be between 1 and 365");
      }

      const rawData = await dashboardRepository.getConsistencyData(
        userId,
        days,
      );

      // Fill in missing dates with 0 workouts
      const filledData = this.fillMissingDates(rawData, days);

      return filledData;
    } catch (error) {
      console.error("Error fetching consistency data:", error);
      if (error instanceof Error && error.message.includes("must be")) {
        throw error; // Re-throw validation errors
      }
      throw new Error("Failed to fetch consistency data");
    }
  }

  async getTrendingMetrics(
    userId: string,
    limit: number = 5,
  ): Promise<TrendingMetric[]> {
    try {
      // Validate parameters
      if (limit < 1 || limit > 20) {
        throw new Error("Limit must be between 1 and 20");
      }

      return await dashboardRepository.getTrendingMetrics(userId, limit);
    } catch (error) {
      console.error("Error fetching trending metrics:", error);
      if (error instanceof Error && error.message.includes("must be")) {
        throw error; // Re-throw validation errors
      }
      throw new Error("Failed to fetch trending metrics");
    }
  }

  async getSummaryStats(userId: string): Promise<SummaryStats> {
    try {
      return await dashboardRepository.getSummaryStats(userId);
    } catch (error) {
      console.error("Error fetching summary stats:", error);
      throw new Error("Failed to fetch summary statistics");
    }
  }

  async getDashboardOverview(userId: string): Promise<DashboardOverview> {
    try {
      // Fetch all dashboard data in parallel for better performance
      const [
        todayWorkout,
        recentHistory,
        weeklyConsistency,
        trendingMetrics,
        summaryStats,
      ] = await Promise.all([
        this.getTodayWorkout(userId),
        this.getWorkoutHistory(userId, 5, 0), // Get last 5 workouts for overview
        this.getConsistencyData(userId, 7), // Get last 7 days for weekly view
        this.getTrendingMetrics(userId, 3), // Get top 3 trending metrics
        this.getSummaryStats(userId),
      ]);

      return {
        todayWorkout,
        recentHistory,
        weeklyConsistency,
        trendingMetrics,
        summaryStats,
      };
    } catch (error) {
      console.error("Error fetching dashboard overview:", error);
      throw new Error("Failed to fetch dashboard overview");
    }
  }

  private fillMissingDates(
    data: ConsistencyData[],
    days: number,
  ): ConsistencyData[] {
    const result: ConsistencyData[] = [];
    const dataMap = new Map(
      data.map((item) => [item.date, item.workoutsCompleted]),
    );

    // Use UTC dates to match backend consistency
    const now = new Date();
    const utcEndDate = new Date(
      now.getTime() + now.getTimezoneOffset() * 60000,
    );

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(utcEndDate);
      date.setUTCDate(utcEndDate.getUTCDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      result.push({
        date: dateStr,
        workoutsCompleted: dataMap.get(dateStr) || 0,
      });
    }

    return result;
  }

  // Helper method to calculate workout streak
  calculateWorkoutStreak(consistencyData: ConsistencyData[]): number {
    let streak = 0;

    // Start from the most recent date and work backwards
    for (let i = consistencyData.length - 1; i >= 0; i--) {
      if (consistencyData[i].workoutsCompleted <= 0) {
        break;
      }
      streak++;
    }

    return streak;
  }

  // Helper method to calculate weekly workout frequency
  calculateWeeklyFrequency(consistencyData: ConsistencyData[]): number {
    const totalWorkouts = consistencyData.reduce(
      (sum, day) => sum + day.workoutsCompleted,
      0,
    );

    const weeks = Math.ceil(consistencyData.length / 7);
    return weeks > 0 ? Math.round((totalWorkouts / weeks) * 100) / 100 : 0;
  }

  // Helper method to format workout duration
  formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${minutes}m`;
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (remainingMinutes === 0) {
      return `${hours}h`;
    }

    return `${hours}h ${remainingMinutes}m`;
  }
}

export const dashboardService = new DashboardService();
