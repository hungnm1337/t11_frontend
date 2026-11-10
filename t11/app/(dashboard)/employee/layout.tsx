import * as React from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export default function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardShell userRole="EMPLOYEE">{children}</DashboardShell>;
}

