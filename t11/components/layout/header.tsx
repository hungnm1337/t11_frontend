import * as React from "react";
import { MobileNav } from "./mobile-nav";

export function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-border bg-surface/95 px-4 sm:px-6 backdrop-blur-xs">
      <div className="flex items-center gap-3">
        <MobileNav />
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-text-secondary">
            Xưởng Cơ Khí
          </span>
          <span className="text-text-muted">/</span>
          <span className="text-xs font-semibold text-text-primary">
            Quản lý dữ liệu
          </span>
        </div>
      </div>
    </header>
  );
}

