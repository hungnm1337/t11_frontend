"use client";

import * as React from "react";
import { NAVIGATION_ITEMS } from "@/constants/navigation";
import { UserRole } from "@/types";
import { NavLinks } from "./nav-links";
import { Wrench, X, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MobileNavProps {
  userRole?: UserRole;
}

export function MobileNav({ userRole = "MANAGER" }: MobileNavProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  // Close on ESC
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="md:hidden h-8 w-8 p-0"
        aria-label="Mở menu điều hướng"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 transition-opacity"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Pane */}
          <div className="relative flex flex-col w-72 max-w-[85vw] h-full bg-surface border-r border-border shadow-lg z-10">
            {/* Header */}
            <div className="flex items-center justify-between px-4 h-14 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-white">
                  <Wrench className="h-3.5 w-3.5" />
                </div>
                <span className="text-xs font-bold uppercase text-text-primary">
                  Cơ Khí Workshop
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 p-0 text-text-secondary"
                aria-label="Đóng menu"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Links */}
            <div className="flex-1 overflow-y-auto py-3">
              <NavLinks
                items={NAVIGATION_ITEMS}
                userRole={userRole}
                onItemClick={() => setIsOpen(false)}
              />
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-border bg-surface-muted/30">
              <span className="text-[11px] text-text-muted">
                Phiên bản MVP 1.0 • Next.js 16
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

