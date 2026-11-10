"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OrderWithRelations, OrderStatus } from "@/types";
import { updateOrderStatus } from "@/services/orderService";
import { formatDate, formatDateTime } from "@/lib/utils";
import { ORDER_STATUS_CONFIG } from "@/constants/status";
import {
  User,
  Phone,
  MapPin,
  Calendar,
  AlertCircle,
  Clock,
  Boxes,
  CheckCircle2,
  History,
  Send,
} from "lucide-react";

interface OrderDetailModalProps {
  order: OrderWithRelations | null;
  isOpen: boolean;
  onClose: () => void;
  onOrderUpdated: () => void;
}

export function OrderDetailModal({
  order,
  isOpen,
  onClose,
  onOrderUpdated,
}: OrderDetailModalProps) {
  const [selectedStatus, setSelectedStatus] = React.useState<OrderStatus>("PENDING");
  const [statusNote, setStatusNote] = React.useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = React.useState(false);
  const [updateError, setUpdateError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (order) {
      setSelectedStatus(order.status);
      setStatusNote("");
      setUpdateError(null);
    }
  }, [order]);

  if (!order) return null;

  const statusConfig = ORDER_STATUS_CONFIG[order.status];
  const isOverdue =
    order.status !== "COMPLETED" &&
    order.status !== "DELIVERED" &&
    order.status !== "CANCELLED" &&
    new Date(order.expectedDate).getTime() < Date.now();

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStatus === order.status && !statusNote.trim()) {
      return;
    }

    setIsUpdatingStatus(true);
    setUpdateError(null);

    try {
      const res = await updateOrderStatus(order.id, selectedStatus, statusNote.trim() || undefined);
      if (!res.success) {
        setUpdateError(res.error || "Không thể cập nhật trạng thái");
        return;
      }
      setStatusNote("");
      onOrderUpdated();
    } catch {
      setUpdateError("Đã xảy ra lỗi khi cập nhật trạng thái.");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Chi tiết đơn hàng: ${order.orderCode}`}
      description={order.description}
      maxWidth="2xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <span className="text-xs text-text-muted">
            Tạo lúc: {formatDateTime(order.createdAt)} bởi {order.createdBy.fullName}
          </span>
          <Button variant="outline" size="sm" onClick={onClose}>
            Đóng
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Header Alert & Summary Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg bg-surface-muted/60 border border-border/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-primary">
                {order.orderCode}
              </span>
              <span
                className={`text-xs px-2.5 py-0.5 rounded border font-medium ${statusConfig.badgeClass}`}
              >
                {statusConfig.label}
              </span>
              {isOverdue && (
                <Badge variant="danger" dot className="bg-rose-100 text-rose-800 border-rose-300">
                  <AlertCircle className="h-3 w-3 mr-1 inline" />
                  Quá hạn hoàn thành
                </Badge>
              )}
            </div>
            <p className="text-xs text-text-secondary mt-1">
              {statusConfig.description}
            </p>
          </div>

          <div className="text-right sm:shrink-0">
            <span className="text-xs text-text-muted block">Hạn bàn giao:</span>
            <span className={`text-sm font-bold ${isOverdue ? "text-danger" : "text-text-primary"}`}>
              {formatDate(order.expectedDate)}
            </span>
          </div>
        </div>

        {/* Customer & Technical Assignment Info */}
        <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: "16px" }}>
          {/* Customer box */}
          <div className="p-3.5 rounded-lg border border-border bg-surface space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted block">
              Khách hàng & Giao nhận
            </span>
            <div className="flex items-center gap-2 text-xs font-semibold text-text-primary">
              <User className="h-3.5 w-3.5 text-text-muted" />
              {order.customerName}
            </div>
            <div className="flex items-center gap-2 text-xs text-text-secondary">
              <Phone className="h-3.5 w-3.5 text-text-muted" />
              {order.customerPhone}
            </div>
            <div className="flex items-start gap-2 text-xs text-text-secondary">
              <MapPin className="h-3.5 w-3.5 text-text-muted shrink-0 mt-0.5" />
              <span>{order.customerAddress || "Nhận tại xưởng"}</span>
            </div>
          </div>

          {/* Assignment & Production Specs box */}
          <div className="p-3.5 rounded-lg border border-border bg-surface space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted block">
              Thông số gia công & Phụ trách
            </span>
            <div className="flex items-center justify-between text-xs">
              <span className="text-text-secondary">Số lượng sản phẩm:</span>
              <span className="font-bold font-mono text-text-primary">
                {order.quantity} bộ / cái
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-text-secondary">Kỹ thuật viên phụ trách:</span>
              <span className="font-semibold text-primary">
                {order.assignedTo ? order.assignedTo.fullName : "Chưa phân công"}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-text-secondary">Ngày bắt đầu:</span>
              <span className="text-text-primary">
                {formatDate(order.startDate)}
              </span>
            </div>
          </div>
        </div>

        {/* Status Update Quick Action */}
        <div className="p-4 rounded-lg border border-primary/20 bg-primary/5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-primary" />
              Cập nhật tiến độ & Trạng thái đơn hàng
            </span>
          </div>

          {updateError && (
            <p className="text-xs text-danger">{updateError}</p>
          )}

          <form onSubmit={handleUpdateStatus} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-1">
                <label className="block text-[11px] font-medium text-text-secondary mb-1">
                  Trạng thái mới
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as OrderStatus)}
                  className="w-full h-9 rounded-md border border-border bg-surface px-3 text-xs font-medium text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                >
                  <option value="PENDING">Chờ xử lý</option>
                  <option value="CONFIRMED">Đã xác nhận</option>
                  <option value="IN_PROGRESS">Đang sản xuất</option>
                  <option value="COMPLETED">Hoàn thành</option>
                  <option value="DELIVERED">Đã bàn giao</option>
                  <option value="CANCELLED">Đã hủy</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-medium text-text-secondary mb-1">
                  Ghi chú tiến độ (Công việc đã làm, lý do...)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ví dụ: Đã cắt phôi và hàn khung xong..."
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    className="flex-1 h-9 rounded-md border border-border bg-surface px-3 text-xs text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    isLoading={isUpdatingStatus}
                    disabled={selectedStatus === order.status && !statusNote.trim()}
                  >
                    <Send className="h-3.5 w-3.5 mr-1" />
                    Lưu
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Bill of Materials (BOM) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
              <Boxes className="h-4 w-4 text-text-secondary" />
              Định mức nguyên vật liệu (BOM)
            </span>
            <span className="text-xs text-text-muted">
              {order.materials?.length || 0} hạng mục vật tư
            </span>
          </div>

          {!order.materials || order.materials.length === 0 ? (
            <div className="p-4 rounded-md border border-dashed border-border text-center text-xs text-text-muted">
              Chưa gán định mức vật tư cho đơn hàng này.
            </div>
          ) : (
            <div className="rounded-md border border-border overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-surface-muted/60 text-text-secondary font-medium border-b border-border">
                  <tr>
                    <th className="py-2 px-3">Mã SKU</th>
                    <th className="py-2 px-3">Tên vật tư</th>
                    <th className="py-2 px-3 text-right">Định mức yêu cầu</th>
                    <th className="py-2 px-3 text-right">Đã xuất kho</th>
                    <th className="py-2 px-3 text-center">Tình trạng</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 bg-surface">
                  {order.materials.map((om) => {
                    const isFulfilled = om.quantityUsed >= om.quantityRequired;
                    return (
                      <tr key={om.id} className="hover:bg-surface-muted/40">
                        <td className="py-2 px-3 font-mono font-bold text-primary">
                          {om.material.materialCode}
                        </td>
                        <td className="py-2 px-3 font-medium text-text-primary">
                          {om.material.name}
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-semibold">
                          {om.quantityRequired} {om.material.unit}
                        </td>
                        <td className="py-2 px-3 text-right font-mono text-text-secondary">
                          {om.quantityUsed} {om.material.unit}
                        </td>
                        <td className="py-2 px-3 text-center">
                          {isFulfilled ? (
                            <Badge variant="success" dot>
                              Đã xuất đủ
                            </Badge>
                          ) : (
                            <Badge variant="warning" dot>
                              Chưa xuất đủ
                            </Badge>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Status History Timeline */}
        <div className="space-y-3">
          <span className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
            <History className="h-4 w-4 text-text-secondary" />
            Lịch sử thay đổi trạng thái
          </span>

          {!order.statusHistories || order.statusHistories.length === 0 ? (
            <p className="text-xs text-text-muted italic">
              Chưa có lịch sử thay đổi.
            </p>
          ) : (
            <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
              {order.statusHistories.map((hist) => {
                const conf = ORDER_STATUS_CONFIG[hist.newStatus];
                return (
                  <div key={hist.id} className="relative space-y-0.5 text-xs">
                    <span className="absolute -left-6 top-1 h-2 w-2 rounded-full bg-primary" />
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-text-primary">
                        {conf.label}
                      </span>
                      <span className="text-[11px] text-text-muted">
                        • {formatDateTime(hist.createdAt)}
                      </span>
                      {hist.changedBy && (
                        <span className="text-[11px] text-primary">
                          ({hist.changedBy.fullName})
                        </span>
                      )}
                    </div>
                    {hist.note && (
                      <p className="text-text-secondary bg-surface-muted/50 p-2 rounded border border-border/50 text-[11px]">
                        {hist.note}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

