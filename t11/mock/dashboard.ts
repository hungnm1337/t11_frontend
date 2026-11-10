import {
  DashboardStats,
  MonthlyOrdersChartData,
  OrderStatusDistribution,
  InventoryFlowChartData,
} from "@/types";
import { MOCK_ORDERS } from "./orders";
import { MOCK_MATERIALS, MOCK_MATERIALS_WITH_CATEGORY } from "./materials";
import { ORDER_STATUS_CONFIG } from "@/constants/status";

// Calculate total inventory value
export const TOTAL_INVENTORY_VALUE = MOCK_MATERIALS.reduce(
  (sum, item) => sum + item.quantity * item.unitPrice,
  0
);

// Count low stock items
export const LOW_STOCK_COUNT = MOCK_MATERIALS.filter(
  (item) => item.quantity <= item.minQuantity
).length;

export const MOCK_DASHBOARD_STATS: DashboardStats = {
  totalOrders: MOCK_ORDERS.length,
  inProgressOrders: MOCK_ORDERS.filter((o) => o.status === "IN_PROGRESS").length,
  completedOrders: MOCK_ORDERS.filter((o) => o.status === "COMPLETED" || o.status === "DELIVERED").length,
  overdueOrders: 1, // DH-2026-004
  totalMaterials: MOCK_MATERIALS.length,
  totalInventoryValue: TOTAL_INVENTORY_VALUE,
  lowStockCount: LOW_STOCK_COUNT,
};

// Monthly orders chart data (6 recent months)
export const MOCK_MONTHLY_ORDERS: MonthlyOrdersChartData[] = [
  { month: "T06", completed: 18, inProgress: 4, cancelled: 1 },
  { month: "T07", completed: 22, inProgress: 6, cancelled: 0 },
  { month: "T08", completed: 25, inProgress: 5, cancelled: 2 },
  { month: "T09", completed: 20, inProgress: 7, cancelled: 1 },
  { month: "T10", completed: 28, inProgress: 8, cancelled: 1 },
  { month: "T11", completed: 5, inProgress: 3, cancelled: 0 },
];

// Status distribution
export const MOCK_ORDER_STATUS_DISTRIBUTION: OrderStatusDistribution[] = [
  {
    status: "PENDING",
    label: ORDER_STATUS_CONFIG.PENDING.label,
    count: MOCK_ORDERS.filter((o) => o.status === "PENDING").length,
    color: "#f59e0b",
  },
  {
    status: "CONFIRMED",
    label: ORDER_STATUS_CONFIG.CONFIRMED.label,
    count: MOCK_ORDERS.filter((o) => o.status === "CONFIRMED").length,
    color: "#0284c7",
  },
  {
    status: "IN_PROGRESS",
    label: ORDER_STATUS_CONFIG.IN_PROGRESS.label,
    count: MOCK_ORDERS.filter((o) => o.status === "IN_PROGRESS").length,
    color: "#2563eb",
  },
  {
    status: "COMPLETED",
    label: ORDER_STATUS_CONFIG.COMPLETED.label,
    count: MOCK_ORDERS.filter((o) => o.status === "COMPLETED").length,
    color: "#16a34a",
  },
  {
    status: "DELIVERED",
    label: ORDER_STATUS_CONFIG.DELIVERED.label,
    count: MOCK_ORDERS.filter((o) => o.status === "DELIVERED").length,
    color: "#64748b",
  },
  {
    status: "CANCELLED",
    label: ORDER_STATUS_CONFIG.CANCELLED.label,
    count: MOCK_ORDERS.filter((o) => o.status === "CANCELLED").length,
    color: "#e11d48",
  },
];

// Monthly inventory flow (VNĐ)
export const MOCK_INVENTORY_FLOW: InventoryFlowChartData[] = [
  { month: "T06", importValue: 120000000, exportValue: 95000000 },
  { month: "T07", importValue: 145000000, exportValue: 118000000 },
  { month: "T08", importValue: 110000000, exportValue: 130000000 },
  { month: "T09", importValue: 160000000, exportValue: 142000000 },
  { month: "T10", importValue: 185000000, exportValue: 165000000 },
  { month: "T11", importValue: 78000000, exportValue: 52000000 },
];

export const MOCK_LOW_STOCK_MATERIALS = MOCK_MATERIALS_WITH_CATEGORY.filter(
  (m) => m.isLowStock
);

