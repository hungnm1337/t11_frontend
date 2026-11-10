import * as React from "react";
import { Suspense } from "react";
import { connection } from "next/server";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Skeleton } from "@/components/ui/skeleton";
import { OrderTable } from "@/components/orders/order-table";
import { getOrders } from "@/services/orderService";
import { getEmployees } from "@/services/employeeService";
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

export const metadata = {
  title: "Quản lý đơn hàng gia công - Xưởng cơ khí",
  description: "Theo dõi đơn hàng, tiến độ gia công, phân công kỹ thuật viên và định mức vật tư.",
};

// Next.js 16: Disables blocking prerender warning for this dynamic data route
export const instant = false;

async function OrdersContent() {
  await connection();

  const [ordersRes, employeesRes] = await Promise.all([
    getOrders({ page: 1, limit: 10 }),
    getEmployees(),
  ]);

  const orders = ordersRes.data;
  const pagination = ordersRes.pagination;
  const employees = employeesRes.data.filter((u) => u.role === "EMPLOYEE");

  const total = pagination.total;
  const inProgressCount = orders.filter((o) => o.status === "IN_PROGRESS").length;
  const completedCount = orders.filter(
    (o) => o.status === "COMPLETED" || o.status === "DELIVERED"
  ).length;
  const now = Date.now();
  const overdueCount = orders.filter(
    (o) =>
      o.status !== "COMPLETED" &&
      o.status !== "DELIVERED" &&
      o.status !== "CANCELLED" &&
      new Date(o.expectedDate).getTime() < now
  ).length;

  return (
    <>


      {/* Interactive Orders Table with search, status filters, and modals */}
      <OrderTable
        initialOrders={orders}
        initialPagination={pagination}
        employees={employees}
      />
    </>
  );
}

function OrdersLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-5 rounded-lg border border-border bg-surface space-y-3">
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-7 w-1/3" />
            <Skeleton className="h-2 w-2/3" />
          </div>
        ))}
      </div>
      <div className="rounded-lg border border-border bg-surface p-6 space-y-4">
        <Skeleton className="h-9 w-1/3" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}

export default function ManagerOrdersPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý đơn hàng gia công cơ khí"
        description="Theo dõi danh sách hợp đồng gia công, phân công nhân viên, cập nhật tiến độ sản xuất và định mức vật tư (BOM)."
      />

      <Suspense fallback={<OrdersLoadingSkeleton />}>
        <OrdersContent />
      </Suspense>
    </div>
  );
}
