import * as React from "react";
import { UserRole } from "@/types";
import { MobileNav } from "./mobile-nav";
import { Badge } from "@/components/ui/badge";

interface HeaderProps {
  userRole?: UserRole;
}

export function Header({ userRole = "MANAGER" }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-border bg-surface/95 px-4 sm:px-6 backdrop-blur-xs">
      <div className="flex items-center gap-3">
        <MobileNav userRole={userRole} />
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-text-secondary">
            Xưởng Cơ Khí
          </span>
          <span className="text-text-muted">/</span>
          <span className="text-xs font-semibold text-text-primary">
            {userRole === "MANAGER" ? "Quản lý điều hành" : "Khu vực sản xuất"}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Badge variant="success" dot className="hidden sm:inline-flex">
          Hệ thống trực tuyến
        </Badge>
        <span className="text-xs font-medium px-2 py-0.5 rounded bg-surface-muted text-text-secondary border border-border">
          {userRole === "MANAGER" ? "Vai trò: Quản lý" : "Vai trò: Nhân viên"}
        </span>
      </div>
    </header>
  );
}

