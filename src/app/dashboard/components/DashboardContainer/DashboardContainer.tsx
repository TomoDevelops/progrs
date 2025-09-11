"use client";

import { useDashboard } from "../../hooks/useDashboard";
import { DashboardContent } from "../DashboardContent";

export const DashboardContainer = () => {
  const dashboardState = useDashboard();

  return <DashboardContent dashboardState={dashboardState} />;
};