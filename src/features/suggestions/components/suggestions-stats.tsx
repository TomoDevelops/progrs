import { Card, CardContent } from "@/shared/components/ui/card";
import { Target, Clock, Dumbbell } from "lucide-react";

export function SuggestionsStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardContent className="flex items-center gap-4 p-6">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Target className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Personalized</p>
            <p className="text-2xl font-bold">4-10</p>
            <p className="text-sm text-muted-foreground">Exercises per routine</p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="flex items-center gap-4 p-6">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Clock className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Time Efficient</p>
            <p className="text-2xl font-bold">15-90</p>
            <p className="text-sm text-muted-foreground">Minutes duration</p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="flex items-center gap-4 p-6">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Dumbbell className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Equipment Flexible</p>
            <p className="text-2xl font-bold">Any</p>
            <p className="text-sm text-muted-foreground">From bodyweight to full gym</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}