"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NavItem, UserRole } from "@/types";
import {
  LayoutDashboard,
  ClipboardList,
  Boxes,
  ArrowLeftRight,
  Users,
  BarChart3,
  LucideIcon,
} from "lucide-react";

interface NavLinksProps {
  items: NavItem[];
  userRole: UserRole;
  onItemClick?: () => void;
}

const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard,
  ClipboardList,
  Boxes,
  ArrowLeftRight,
  Users,
  BarChart3,
};

export function NavLinks({ items, userRole, onItemClick }: NavLinksProps) {
  const pathname = usePathname();

  const filteredItems = items.filter((item) => item.roles.includes(userRole));

  return (
    <nav className="flex flex-col gap-1 px-3 py-2">
      {filteredItems.map((item) => {
        const Icon = ICON_MAP[item.iconName] || LayoutDashboard;
        const isActive =
          pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onItemClick}
            prefetch={true}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-colors select-none",
              isActive
                ? "bg-primary text-white shadow-xs"
                : "text-text-secondary hover:text-text-primary hover:bg-surface-muted"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="truncate">{item.title}</span>
            {item.badge !== undefined && (
              <span
                className={cn(
                  "ml-auto text-[10px] font-semibold px-1.5 py-0.2 rounded-full",
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-surface-muted text-text-muted"
                )}
              >
                {item.badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

