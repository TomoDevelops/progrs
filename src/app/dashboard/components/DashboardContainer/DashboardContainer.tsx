"use client";

import { useDashboard } from "@/app/dashboard/hooks/useDashboard";
import { DashboardContent } from "@/app/dashboard/components/DashboardContent";

export const DashboardContainer = () => {
  const dashboardState = useDashboard();

  return <DashboardContent dashboardState={dashboardState} />;
};