"use client";

import * as React from "react";
import { OrderWithRelations, PaginationMeta, User, OrderStatus } from "@/types";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { OrderFormModal } from "./order-form-modal";
import { OrderDetailModal } from "./order-detail-modal";
import { getOrders, getOrderById } from "@/services/orderService";
import { formatDate } from "@/lib/utils";
import { ORDER_STATUS_CONFIG } from "@/constants/status";
import {
  Search,
  Filter,
  Plus,
  Eye,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  AlertCircle,
  User as UserIcon,
} from "lucide-react";

interface OrderTableProps {
  initialOrders: OrderWithRelations[];
  initialPagination: PaginationMeta;
  employees: User[];
}

export function OrderTable({
  initialOrders,
  initialPagination,
  employees,
}: OrderTableProps) {
  const [orders, setOrders] = React.useState<OrderWithRelations[]>(initialOrders);
  const [pagination, setPagination] = React.useState<PaginationMeta>(initialPagination);
  const [isLoading, setIsLoading] = React.useState(false);

  // Filter states
  const [search, setSearch] = React.useState("");
  const [selectedStatus, setSelectedStatus] = React.useState<OrderStatus | "ALL">("ALL");
  const [selectedAssignee, setSelectedAssignee] = React.useState<string>("ALL");

  // Modal states
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [viewingOrder, setViewingOrder] = React.useState<OrderWithRelations | null>(null);

  const fetchOrders = React.useCallback(
    async (page = 1) => {
      setIsLoading(true);
      try {
        const res = await getOrders({
          page,
          limit: 10,
          search,
          status: selectedStatus === "ALL" ? undefined : selectedStatus,
          assignedToId: selectedAssignee === "ALL" ? undefined : selectedAssignee,
        });
        if (res.success) {
          setOrders(res.data);
          setPagination(res.pagination);
        }
      } catch (err) {
        console.error("Lỗi khi tải danh sách đơn hàng:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [search, selectedStatus, selectedAssignee]
  );

  React.useEffect(() => {
    const timer = setTimeout(() => {
      fetchOrders(1);
    }, 250);
    return () => clearTimeout(timer);
  }, [search, selectedStatus, selectedAssignee, fetchOrders]);

  const handleOpenDetail = async (orderId: string) => {
    try {
      const res = await getOrderById(orderId);
      if (res.success && res.data) {
        setViewingOrder(res.data);
      }
    } catch (e) {
      console.error("Lỗi khi tải chi tiết đơn hàng:", e);
    }
  };

  const handleOrderUpdated = async () => {
    if (viewingOrder) {
      const res = await getOrderById(viewingOrder.id);
      if (res.success && res.data) {
        setViewingOrder(res.data);
      }
    }
    fetchOrders(pagination.page);
  };

  return (
    <div className="space-y-4">
      {/* Top Filter and Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-surface p-4 rounded-lg border border-border shadow-xs">
        <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none" />
            <input
              type="text"
              placeholder="Tìm theo mã đơn, khách hàng, số điện thoại..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-md border border-border bg-surface text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary"
            />
          </div>

          {/* Status Dropdown */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-text-muted shrink-0" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as OrderStatus | "ALL")}
              className="h-9 rounded-md border border-border bg-surface px-3 text-xs font-medium text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="PENDING">Chờ xử lý</option>
              <option value="CONFIRMED">Đã xác nhận</option>
              <option value="IN_PROGRESS">Đang sản xuất</option>
              <option value="COMPLETED">Hoàn thành</option>
              <option value="DELIVERED">Đã bàn giao</option>
              <option value="CANCELLED">Đã hủy</option>
            </select>
          </div>

          {/* Assignee Filter */}
          <div className="flex items-center gap-2">
            <UserIcon className="h-4 w-4 text-text-muted shrink-0" />
            <select
              value={selectedAssignee}
              onChange={(e) => setSelectedAssignee(e.target.value)}
              className="h-9 rounded-md border border-border bg-surface px-3 text-xs font-medium text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            >
              <option value="ALL">Tất cả kỹ thuật viên</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.fullName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchOrders(pagination.page)}
            title="Làm mới dữ liệu"
          >
            <RotateCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
          <Button variant="primary" size="sm" onClick={() => setIsFormOpen(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Tạo đơn hàng
          </Button>
        </div>
      </div>

      {/* Orders Table Card */}
      <div className="rounded-lg border border-border bg-surface shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-3">
            <div className="h-6 bg-surface-muted animate-pulse rounded w-1/4" />
            <div className="h-10 bg-surface-muted animate-pulse rounded" />
            <div className="h-10 bg-surface-muted animate-pulse rounded" />
            <div className="h-10 bg-surface-muted animate-pulse rounded" />
            <div className="h-10 bg-surface-muted animate-pulse rounded" />
          </div>
        ) : orders.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={ClipboardList}
              title="Không tìm thấy đơn hàng nào"
              description="Thử đổi bộ lọc tìm kiếm hoặc tạo đơn hàng gia công cơ khí mới."
              action={
                <Button variant="primary" size="sm" onClick={() => setIsFormOpen(true)}>
                  <Plus className="h-4 w-4 mr-1" />
                  Tạo đơn hàng ngay
                </Button>
              }
            />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">Mã đơn</TableHead>
                <TableHead>Khách hàng & Liên hệ</TableHead>
                <TableHead>Hạng mục gia công</TableHead>
                <TableHead className="text-center">Số lượng</TableHead>
                <TableHead>Ngày hẹn giao</TableHead>
                <TableHead>Phụ trách</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-center w-[90px]">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => {
                const conf = ORDER_STATUS_CONFIG[order.status];
                const isOverdue =
                  order.status !== "COMPLETED" &&
                  order.status !== "DELIVERED" &&
                  order.status !== "CANCELLED" &&
                  new Date(order.expectedDate).getTime() < Date.now();

                return (
                  <TableRow
                    key={order.id}
                    className={isOverdue ? "bg-rose-50/20 hover:bg-rose-50/40" : ""}
                  >
                    <TableCell className="font-mono text-xs font-bold text-primary">
                      {order.orderCode}
                    </TableCell>

                    <TableCell>
                      <div className="font-semibold text-text-primary text-xs">
                        {order.customerName}
                      </div>
                      <div className="text-[11px] text-text-muted font-mono">
                        {order.customerPhone}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="text-xs text-text-primary font-medium line-clamp-1 max-w-xs">
                        {order.description}
                      </div>
                    </TableCell>

                    <TableCell className="text-center font-mono text-xs font-bold text-text-primary">
                      {order.quantity}
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1.5 text-xs">
                        <span
                          className={
                            isOverdue
                              ? "text-danger font-semibold flex items-center gap-1"
                              : "text-text-secondary"
                          }
                        >
                          {isOverdue && <AlertCircle className="h-3.5 w-3.5 inline" />}
                          {formatDate(order.expectedDate)}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="text-xs text-text-secondary">
                      {order.assignedTo ? (
                        <span className="font-medium text-text-primary">
                          {order.assignedTo.fullName}
                        </span>
                      ) : (
                        <span className="text-text-muted italic">Chưa giao</span>
                      )}
                    </TableCell>

                    <TableCell>
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded font-medium ${conf.badgeClass}`}
                      >
                        {conf.label}
                      </span>
                    </TableCell>

                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenDetail(order.id)}
                        className="h-7 px-2 text-xs gap-1"
                        title="Xem chi tiết & cập nhật trạng thái"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Xem
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}

        {/* Pagination Footer */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border px-4 py-3 bg-surface-muted/30">
            <span className="text-xs text-text-secondary">
              Hiển thị{" "}
              <span className="font-semibold text-text-primary">
                {orders.length}
              </span>{" "}
              trên tổng số{" "}
              <span className="font-semibold text-text-primary">
                {pagination.total}
              </span>{" "}
              đơn hàng
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page <= 1 || isLoading}
                onClick={() => fetchOrders(pagination.page - 1)}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Trước
              </Button>
              <span className="text-xs text-text-muted px-2">
                Trang {pagination.page} / {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page >= pagination.totalPages || isLoading}
                onClick={() => fetchOrders(pagination.page + 1)}
              >
                Sau
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Create Order */}
      <OrderFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        employees={employees}
        onSuccess={() => fetchOrders(1)}
      />

      {/* Modal Order Detail */}
      <OrderDetailModal
        isOpen={!!viewingOrder}
        order={viewingOrder}
        onClose={() => setViewingOrder(null)}
        onOrderUpdated={handleOrderUpdated}
      />
    </div>
  );
}
