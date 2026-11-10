import {
  DashboardStats,
  MonthlyOrdersChartData,
  OrderStatusDistribution,
  InventoryFlowChartData,
  OrderWithRelations,
  MaterialWithCategory,
  ActivityLog,
  ApiResponse,
} from "@/types";
import { API_CONFIG, simulateDelay } from "./apiConfig";
import {
  MOCK_DASHBOARD_STATS,
  MOCK_MONTHLY_ORDERS,
  MOCK_ORDER_STATUS_DISTRIBUTION,
  MOCK_INVENTORY_FLOW,
  MOCK_LOW_STOCK_MATERIALS,
  MOCK_ACTIVITY_LOGS,
} from "@/mock";
import { getOrders } from "./orderService";

export interface DashboardOverviewData {
  stats: DashboardStats;
  monthlyOrders: MonthlyOrdersChartData[];
  statusDistribution: OrderStatusDistribution[];
  inventoryFlow: InventoryFlowChartData[];
  recentOrders: OrderWithRelations[];
  lowStockMaterials: MaterialWithCategory[];
  recentActivities: ActivityLog[];
}

/**
 * Get core dashboard KPI statistics.
 */
export async function getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
  if (API_CONFIG.useMock) {
    await simulateDelay(80);
    return {
      success: true,
      data: MOCK_DASHBOARD_STATS,
    };
  }

  const res = await fetch(`${API_CONFIG.baseUrl}/dashboard/stats`);
  if (!res.ok) throw new Error("Không thể tải số liệu thống kê tổng quan");
  return res.json();
}

/**
 * Get comprehensive overview for the manager dashboard.
 */
export async function getDashboardOverview(): Promise<
  ApiResponse<DashboardOverviewData>
> {
  if (API_CONFIG.useMock) {
    await simulateDelay(120);

    const ordersRes = await getOrders({ limit: 5 });

    return {
      success: true,
      data: {
        stats: MOCK_DASHBOARD_STATS,
        monthlyOrders: MOCK_MONTHLY_ORDERS,
        statusDistribution: MOCK_ORDER_STATUS_DISTRIBUTION,
        inventoryFlow: MOCK_INVENTORY_FLOW,
        recentOrders: ordersRes.data,
        lowStockMaterials: MOCK_LOW_STOCK_MATERIALS,
        recentActivities: MOCK_ACTIVITY_LOGS,
      },
    };
  }

  const res = await fetch(`${API_CONFIG.baseUrl}/dashboard/overview`);
  if (!res.ok) throw new Error("Không thể tải dữ liệu bảng điều khiển");
  return res.json();
}

