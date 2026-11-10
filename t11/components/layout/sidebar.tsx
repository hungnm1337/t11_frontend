import * as React from "react";
import { cn } from "@/lib/utils";
import { NAVIGATION_ITEMS } from "@/constants/navigation";
import { UserRole } from "@/types";
import { NavLinks } from "./nav-links";
import { Wrench } from "lucide-react";

interface SidebarProps {
  userRole?: UserRole;
  className?: string;
}

export function Sidebar({ userRole = "MANAGER", className }: SidebarProps) {
  return (
    <aside
      className={cn(
        "hidden md:flex flex-col w-64 border-r border-border bg-surface shrink-0 h-screen sticky top-0",
        className
      )}
    >
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-5 h-14 border-b border-border/80">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-white">
          <Wrench className="h-4 w-4" aria-hidden="true" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-bold uppercase tracking-wider text-text-primary">
            Cơ Khí Workshop
          </span>
          <span className="text-[10px] text-text-muted">
            Quản lý sản xuất & kho
          </span>
        </div>
      </div>

      {/* Navigation Group */}
      <div className="flex-1 overflow-y-auto py-3">
        <div className="px-5 mb-2">
          <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">
            {userRole === "MANAGER" ? "Phân hệ quản lý" : "Phân hệ nhân viên"}
          </p>
        </div>
        <NavLinks items={NAVIGATION_ITEMS} userRole={userRole} />
      </div>

      {/* User Footer Summary */}
      <div className="p-3 border-t border-border/80 bg-surface-muted/40">
        <div className="flex items-center gap-3 px-2 py-1.5 rounded-md">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">
            {userRole === "MANAGER" ? "QL" : "NV"}
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-xs font-semibold text-text-primary truncate">
              {userRole === "MANAGER" ? "Nguyễn Văn Quản Lý" : "Trần Văn Thợ"}
            </span>
            <span className="text-[10px] text-text-secondary truncate">
              {userRole === "MANAGER" ? "Quản lý xưởng" : "Kỹ thuật gia công"}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}

