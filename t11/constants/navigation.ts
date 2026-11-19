import { NavItem } from "@/types";
import {
  MASTER_DATA_DEFINITIONS,
  MASTER_DATA_RESOURCES,
} from "@/lib/master-data-definitions";

export const NAVIGATION_ITEMS: NavItem[] = [
  {
    title: "Tổng quan",
    href: "/manager/dashboard",
    iconName: "LayoutDashboard",
  },
  ...MASTER_DATA_RESOURCES.map((resource) => ({
    title: MASTER_DATA_DEFINITIONS[resource].label,
    href: `/manager/master-data/${resource}`,
    iconName: "Boxes",
  })),
];

