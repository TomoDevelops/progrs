import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  User,
  Settings,
  LogOut,
  Dumbbell,
  Target,
  TrendingUp,
} from "lucide-react";
import type { UseDashboardReturn } from "@/app/dashboard/hooks/useDashboard";

interface DashboardContentProps {
  dashboardState: UseDashboardReturn;
}

export const DashboardContent = ({ dashboardState }: DashboardContentProps) => {
  const { user, isLoading, handleSignOut } = dashboardState;

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                <span className="text-sm font-bold text-white">P</span>
              </div>
              <span className="ml-2 text-xl font-semibold">Progrs</span>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user.name || user.username}! 👋
          </h1>
          <p className="mt-2 text-gray-600">
            Ready to crush your fitness goals today?
          </p>
        </div>

        {/* Account Status */}
        {!user.emailVerified && (
          <div className="mb-6">
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-orange-800">
                      Verify your email
                    </h3>
                    <p className="mt-1 text-sm text-orange-600">
                      Please verify your email address to access all features.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    Verify now
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Stats Grid */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Workouts
              </CardTitle>
              <Dumbbell className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-muted-foreground text-xs">
                Start your first workout!
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Goals Achieved
              </CardTitle>
              <Target className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-muted-foreground text-xs">
                Set your first goal!
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Progress Streak
              </CardTitle>
              <TrendingUp className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0 days</div>
              <p className="text-muted-foreground text-xs">Keep going!</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Quick Start</CardTitle>
              <CardDescription>
                Jump right into your fitness journey
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" size="lg">
                <Dumbbell className="mr-3 h-5 w-5" />
                Start New Workout
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                size="lg"
              >
                <Target className="mr-3 h-5 w-5" />
                Set Fitness Goal
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                size="lg"
              >
                <TrendingUp className="mr-3 h-5 w-5" />
                View Progress
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Info</CardTitle>
              <CardDescription>
                Your account details and security
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Email</span>
                  <span className="text-sm text-gray-600">{user.email}</span>
                </div>
                {user.username && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Username</span>
                    <span className="text-sm text-gray-600">
                      {user.username}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Email Verified</span>
                  <span
                    className={`text-sm ${
                      user.emailVerified ? "text-green-600" : "text-orange-600"
                    }`}
                  >
                    {user.emailVerified ? "Verified" : "Pending"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">2FA</span>
                  <span
                    className={`text-sm ${
                      user.twoFactorEnabled ? "text-green-600" : "text-gray-600"
                    }`}
                  >
                    {user.twoFactorEnabled ? "Enabled" : "Disabled"}
                  </span>
                </div>
              </div>

              <Button variant="outline" className="w-full">
                <User className="mr-2 h-4 w-4" />
                Manage Account
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};
