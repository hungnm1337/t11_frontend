import * as React from "react";
import { cn } from "@/lib/utils";
import { NAVIGATION_ITEMS } from "@/constants/navigation";
import { NavLinks } from "./nav-links";
import { Wrench } from "lucide-react";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  return (
    <aside
      className={cn(
        "hidden md:flex flex-col w-64 border-r border-border bg-surface shrink-0 h-screen sticky top-0",
        className
      )}
    >
      <div className="flex items-center gap-3 px-5 h-14 border-b border-border/80">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-white">
          <Wrench className="h-4 w-4" aria-hidden="true" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-bold uppercase tracking-wider text-text-primary">
            Cơ Khí Workshop
          </span>
          <span className="text-[10px] text-text-muted">
            Quản lý dữ liệu
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-3">
        <div className="px-5 mb-2">
          <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">
            Danh mục API
          </p>
        </div>
        <NavLinks items={NAVIGATION_ITEMS} />
      </div>
    </aside>
  );
}

