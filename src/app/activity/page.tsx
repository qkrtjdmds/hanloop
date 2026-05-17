"use client";

import { useEffect } from "react";

import { ActivityPage } from "@/components/activity/ActivityPage";
import { AppShell } from "@/components/layout/AppShell";
import { useCarbonStore } from "@/stores/carbonStore";

export default function ActivityRoutePage() {
  const loadDashboardData = useCarbonStore((state) => state.loadDashboardData);

  useEffect(() => {
    void loadDashboardData();
  }, [loadDashboardData]);

  return (
    <AppShell>
      <ActivityPage />
    </AppShell>
  );
}
