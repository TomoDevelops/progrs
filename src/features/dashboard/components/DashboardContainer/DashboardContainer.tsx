"use client";

import { useDashboard } from "@/features/dashboard/hooks/useDashboard";
import { DashboardContent } from "@/features/dashboard/components/DashboardContent";

export const DashboardContainer = () => {
  const dashboardState = useDashboard();

  return <DashboardContent dashboardState={dashboardState} />;
};
