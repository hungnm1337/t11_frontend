import * as React from "react";
import { UserRole } from "@/types";
import { Sidebar } from "./sidebar";
import { Header } from "./header";

interface DashboardShellProps {
  children: React.ReactNode;
  userRole?: UserRole;
}

export function DashboardShell({
  children,
  userRole = "MANAGER",
}: DashboardShellProps) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <Sidebar userRole={userRole} />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0">
        <Header userRole={userRole} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}

