import { NavItem } from "@/types";

export const NAVIGATION_ITEMS: NavItem[] = [
  // Manager Routes
  {
    title: "Tổng quan",
    href: "/manager/dashboard",
    iconName: "LayoutDashboard",
    roles: ["MANAGER"],
  },
  {
    title: "Đơn hàng",
    href: "/manager/orders",
    iconName: "ClipboardList",
    roles: ["MANAGER"],
  },
  {
    title: "Nguyên vật liệu",
    href: "/manager/materials",
    iconName: "Boxes",
    roles: ["MANAGER"],
  },
  {
    title: "Quản lý kho",
    href: "/manager/inventory",
    iconName: "ArrowLeftRight",
    roles: ["MANAGER"],
  },
  {
    title: "Nhân viên",
    href: "/manager/employees",
    iconName: "Users",
    roles: ["MANAGER"],
  },
  {
    title: "Báo cáo thống kê",
    href: "/manager/reports",
    iconName: "BarChart3",
    roles: ["MANAGER"],
  },

  // Employee Routes
  {
    title: "Bàn làm việc",
    href: "/employee/dashboard",
    iconName: "LayoutDashboard",
    roles: ["EMPLOYEE"],
  },
  {
    title: "Đơn hàng phân công",
    href: "/employee/orders",
    iconName: "ClipboardList",
    roles: ["EMPLOYEE"],
  },
  {
    title: "Tra cứu vật liệu",
    href: "/employee/materials",
    iconName: "Boxes",
    roles: ["EMPLOYEE"],
  },
];

