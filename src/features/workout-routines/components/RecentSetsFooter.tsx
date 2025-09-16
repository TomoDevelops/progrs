import { useRecentSets } from "../hooks/useRecentSets";
import { formatDistanceToNow } from "date-fns";

interface RecentSetsFooterProps {
  exerciseId: string;
}

export function RecentSetsFooter({ exerciseId }: RecentSetsFooterProps) {
  const { data: recentSets, isLoading, error } = useRecentSets(exerciseId);

  if (isLoading) {
    return (
      <div className="mt-4 border-t border-gray-200 pt-4">
        <p className="text-sm text-gray-500">Loading recent sets...</p>
      </div>
    );
  }

  if (error || !recentSets || recentSets.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 border-t border-gray-200 pt-4">
      <h4 className="mb-2 text-sm font-medium text-gray-700">
        Recent Sets (Last 3)
      </h4>
      <div className="space-y-2">
        {recentSets.map((set, index) => (
          <div
            key={set.id}
            className="flex items-center justify-between text-sm text-gray-600"
          >
            <div className="flex items-center space-x-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-xs font-medium">
                {index + 1}
              </span>
              <span>
                {set.weight ? `${set.weight}kg` : "BW"} × {set.reps} reps
              </span>
            </div>
            <span className="text-xs text-gray-400">
              {formatDistanceToNow(new Date(set.sessionDate), {
                addSuffix: true,
              })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
