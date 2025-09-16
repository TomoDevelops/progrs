"use client";

import { Badge } from "@/shared/components/ui/badge";
import { Trophy, Flame, TrendingUp, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { useDashboardData } from "@/features/dashboard/hooks/useDashboardData";
import { formatDistanceToNow } from "date-fns";
import { useQuery } from "@tanstack/react-query";

interface ProgressBadgesProps {
  className?: string;
}

interface PersonalRecord {
  id: string;
  exerciseName: string;
  maxWeight: number;
  achievedAt: Date;
  isRecent: boolean;
}

interface StreakInfo {
  current: number;
  longest: number;
  isActive: boolean;
}

// API function to fetch personal records
const fetchPersonalRecords = async (): Promise<PersonalRecord[]> => {
  const response = await fetch("/api/dashboard/personal-records?limit=5&days=30");
  if (!response.ok) {
    throw new Error("Failed to fetch personal records");
  }
  const result = await response.json();
  return result.data;
};

export const ProgressBadges = ({ className }: ProgressBadgesProps) => {
  const { stats, consistency } = useDashboardData();
  
  // Fetch personal records
  const { data: recentPRs = [] } = useQuery({
    queryKey: ["personal-records"],
    queryFn: fetchPersonalRecords,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Calculate current streak from consistency data
  const calculateCurrentStreak = () => {
    if (!consistency.data || consistency.data.length === 0) return 0;
    
    let streak = 0;
    const sortedData = [...consistency.data].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    for (const day of sortedData) {
      if (day.workoutsCompleted <= 0) {
        break;
      }
      streak++;
    }
    
    return streak;
  };

  const currentStreak = calculateCurrentStreak();
  const longestStreak = stats.data?.longestStreak || 0;
  const isStreakActive = currentStreak > 0;

  const streakInfo: StreakInfo = {
    current: currentStreak,
    longest: longestStreak,
    isActive: isStreakActive,
  };

  if (recentPRs.length === 0 && currentStreak === 0) {
    return null;
  }

  return (
    <Card className={`border-0 ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-medium tracking-wide">
          <Award className="h-5 w-5 text-yellow-600" />
          Progress Moments
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Personal Records */}
        {recentPRs.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Recent PRs</h4>
            <div className="flex flex-wrap gap-2">
              {recentPRs.map((pr) => (
                <Badge
                  key={pr.id}
                  variant="secondary"
                  className="flex items-center gap-1 bg-yellow-50 text-yellow-800 hover:bg-yellow-100"
                >
                  <Trophy className="h-3 w-3" />
                  <span className="font-medium">{pr.exerciseName}</span>
                  <span className="text-xs">({pr.maxWeight}kg)</span>
                  <span className="text-xs text-yellow-600">
                    {formatDistanceToNow(pr.achievedAt, { addSuffix: true })}
                  </span>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Workout Streaks */}
        {currentStreak > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Workout Streaks</h4>
            <div className="flex flex-wrap gap-2">
              <Badge
                variant="secondary"
                className={`flex items-center gap-1 ${
                  streakInfo.isActive
                    ? "bg-orange-50 text-orange-800 hover:bg-orange-100"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Flame className={`h-3 w-3 ${
                  streakInfo.isActive ? "text-orange-600" : "text-gray-400"
                }`} />
                <span className="font-medium">
                  {streakInfo.current} day{streakInfo.current !== 1 ? 's' : ''} streak
                </span>
                {streakInfo.isActive && (
                  <span className="text-xs text-orange-600">🔥</span>
                )}
              </Badge>
              
              {streakInfo.longest > streakInfo.current && (
                <Badge
                  variant="outline"
                  className="flex items-center gap-1 text-gray-600"
                >
                  <TrendingUp className="h-3 w-3" />
                  <span className="text-xs">
                    Best: {streakInfo.longest} day{streakInfo.longest !== 1 ? 's' : ''}
                  </span>
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Motivational Messages */}
        {currentStreak >= 7 && (
          <div className="rounded-lg bg-green-50 p-3">
            <p className="text-sm text-green-800">
              🎉 Amazing! You&apos;re on a {currentStreak}-day streak. Keep it up!
            </p>
          </div>
        )}
        
        {currentStreak >= 30 && (
          <div className="rounded-lg bg-purple-50 p-3">
            <p className="text-sm text-purple-800">
              🏆 Incredible dedication! 30+ days of consistency!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};