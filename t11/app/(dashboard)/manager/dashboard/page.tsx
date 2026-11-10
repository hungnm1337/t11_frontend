import * as React from "react";
import { Suspense } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ClipboardList,
  Boxes,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
} from "lucide-react";
import { getDashboardOverview } from "@/services";
import { formatDate } from "@/lib/utils";
import { ORDER_STATUS_CONFIG } from "@/constants/status";

export const metadata = {
  title: "Bảng điều khiển - Quản lý xưởng cơ khí",
};

export const instant = false;

async function DashboardContent() {
  const { data } = await getDashboardOverview();
  const { stats, recentOrders, lowStockMaterials } = data;

  return (
    <>
      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Tổng đơn hàng"
          value={stats.totalOrders}
          description="Đơn gia công đã ghi nhận"
          icon={ClipboardList}
        />
        <StatCard
          title="Đang sản xuất"
          value={stats.inProgressOrders}
          description="Đang gia công tại xưởng"
          icon={Clock}
        />
        <StatCard
          title="Đã hoàn thành"
          value={stats.completedOrders}
          description="Hoàn tất & đã bàn giao"
          icon={CheckCircle2}
        />
        <StatCard
          title="Cảnh báo tồn kho"
          value={stats.lowStockCount}
          description="Vật tư dưới mức tối thiểu"
          icon={AlertTriangle}
          className={stats.lowStockCount > 0 ? "border-amber-300 bg-amber-50/30" : ""}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders Overview */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle>Đơn hàng mới nhất</CardTitle>
              <p className="text-xs text-text-secondary mt-0.5">
                Các đơn hàng đang trong chu trình sản xuất
              </p>
            </div>
            <Link href="/manager/orders">
              <Button variant="ghost" size="sm" className="text-xs gap-1">
                Xem tất cả <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/60">
              {recentOrders.map((order) => {
                const statusConfig = ORDER_STATUS_CONFIG[order.status];
                return (
                  <div
                    key={order.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-surface-muted/50 transition-colors gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-primary">
                          {order.orderCode}
                        </span>
                        <span className="text-xs font-semibold text-text-primary">
                          {order.customerName}
                        </span>
                      </div>
                      <p className="text-xs text-text-secondary line-clamp-1">
                        {order.description} (SL: {order.quantity})
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs text-text-muted">
                        Hạn: {formatDate(order.expectedDate)}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded border font-medium ${statusConfig.badgeClass}`}
                      >
                        {statusConfig.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Alerts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-amber-800 flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                Vật tư sắp hết
              </CardTitle>
              <p className="text-xs text-text-secondary mt-0.5">
                Cần nhập thêm để không trễ đơn
              </p>
            </div>
            <Link href="/manager/materials">
              <Button variant="ghost" size="sm" className="text-xs">
                Chi tiết
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/60">
              {lowStockMaterials.length === 0 ? (
                <div className="p-6 text-center text-xs text-text-muted">
                  Kho hiện tại đủ định mức an toàn.
                </div>
              ) : (
                lowStockMaterials.map((mat) => (
                  <div key={mat.id} className="p-3.5 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-text-primary">
                        {mat.name}
                      </span>
                      <span className="font-mono text-xs text-danger font-bold">
                        {mat.quantity} {mat.unit}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-text-muted">
                      <span>Mã: {mat.materialCode}</span>
                      <span>Tối thiểu: {mat.minQuantity} {mat.unit}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-5 rounded-lg border border-border bg-surface space-y-3">
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-7 w-1/3" />
            <Skeleton className="h-2 w-2/3" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-lg border border-border bg-surface p-5 space-y-4">
          <Skeleton className="h-5 w-1/4" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
        <div className="rounded-lg border border-border bg-surface p-5 space-y-4">
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </div>
  );
}

export default function ManagerDashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Bảng điều khiển quản lý xưởng"
        description="Theo dõi tình hình hoạt động, đơn hàng gia công và tồn kho nguyên vật liệu của xưởng."
      >
        <Link href="/manager/orders">
          <Button variant="outline" size="sm">
            <ClipboardList className="h-4 w-4 mr-1.5" />
            Đơn hàng
          </Button>
        </Link>
        <Link href="/manager/materials">
          <Button variant="primary" size="sm">
            <Boxes className="h-4 w-4 mr-1.5" />
            Kho vật tư
          </Button>
        </Link>
      </PageHeader>

      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}
