import * as React from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export default function ManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardShell userRole="MANAGER">{children}</DashboardShell>;
}

