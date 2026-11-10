"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User } from "@/types";
import { createOrder, CreateOrderPayload } from "@/services/orderService";

interface OrderFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: User[];
  onSuccess: () => void;
}

export function OrderFormModal({
  isOpen,
  onClose,
  employees,
  onSuccess,
}: OrderFormModalProps) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 7);
  const defaultExpectedDate = tomorrow.toISOString().split("T")[0];

  const [formData, setFormData] = React.useState<CreateOrderPayload>({
    customerName: "",
    customerPhone: "",
    customerAddress: "",
    description: "",
    quantity: 1,
    expectedDate: defaultExpectedDate,
    assignedToId: employees[0]?.id || "",
  });

  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [apiError, setApiError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      setFormData({
        customerName: "",
        customerPhone: "",
        customerAddress: "",
        description: "",
        quantity: 1,
        expectedDate: defaultExpectedDate,
        assignedToId: employees[0]?.id || "",
      });
      setErrors({});
      setApiError(null);
    }
  }, [isOpen, employees, defaultExpectedDate]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.customerName.trim()) {
      newErrors.customerName = "Tên khách hàng / đơn vị đặt là bắt buộc";
    }
    if (!formData.customerPhone.trim()) {
      newErrors.customerPhone = "Số điện thoại liên hệ là bắt buộc";
    }
    if (!formData.description.trim()) {
      newErrors.description = "Mô tả sản phẩm / hạng mục gia công là bắt buộc";
    }
    if (formData.quantity <= 0) {
      newErrors.quantity = "Số lượng gia công phải lớn hơn 0";
    }
    if (!formData.expectedDate) {
      newErrors.expectedDate = "Vui lòng chọn ngày dự kiến bàn giao";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setApiError(null);

    try {
      const res = await createOrder({
        ...formData,
        expectedDate: new Date(formData.expectedDate).toISOString(),
      });

      if (!res.success) {
        setApiError(res.error || "Không thể tạo đơn hàng");
        return;
      }

      onSuccess();
      onClose();
    } catch {
      setApiError("Đã xảy ra lỗi kết nối. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tạo đơn hàng gia công mới"
      description="Nhập thông tin khách hàng, hạng mục gia công và phân công kỹ thuật viên phụ trách."
      maxWidth="xl"
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Hủy bỏ
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            isLoading={isSubmitting}
            onClick={handleSubmit}
          >
            Tạo đơn hàng
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {apiError && (
          <div className="p-3 text-xs rounded-md bg-rose-50 text-rose-700 border border-rose-200">
            {apiError}
          </div>
        )}

        {/* Customer Information */}
        <div className="space-y-3 mb-4 pb-4 border-b border-border/80">
          <span className="text-xs font-semibold text-text-primary uppercase tracking-wider block">
            Thông tin khách hàng
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Tên khách hàng / Doanh nghiệp *"
              placeholder="Ví dụ: Công ty Cơ khí An Phát, Anh Minh..."
              value={formData.customerName}
              error={errors.customerName}
              onChange={(e) =>
                setFormData({ ...formData, customerName: e.target.value })
              }
            />

            <Input
              label="Số điện thoại liên hệ *"
              placeholder="09xx xxx xxx"
              value={formData.customerPhone}
              error={errors.customerPhone}
              onChange={(e) =>
                setFormData({ ...formData, customerPhone: e.target.value })
              }
            />
          </div>

          <Input
            label="Địa chỉ giao hàng / thi công"
            placeholder="Số nhà, khu công nghiệp, quận/huyện..."
            value={formData.customerAddress}
            onChange={(e) =>
              setFormData({ ...formData, customerAddress: e.target.value })
            }
          />
        </div>

        {/* Order Details */}
        <div className="space-y-3">
          <span className="text-xs font-semibold text-text-primary uppercase tracking-wider block">
            Chi tiết gia công
          </span>

          <Input
            label="Hạng mục sản phẩm / Chi tiết gia công *"
            placeholder="Ví dụ: Gia công 10 bộ khung bàn inox 304, bồn chứa 500L..."
            value={formData.description}
            error={errors.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Số lượng (Bộ / Cái / Mét) *"
              type="number"
              min="1"
              value={formData.quantity}
              error={errors.quantity}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  quantity: parseInt(e.target.value, 10) || 1,
                })
              }
            />

            <Input
              label="Ngày hẹn hoàn thành *"
              type="date"
              value={formData.expectedDate}
              error={errors.expectedDate}
              onChange={(e) =>
                setFormData({ ...formData, expectedDate: e.target.value })
              }
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-text-secondary">
                Kỹ thuật viên phụ trách
              </label>
              <select
                value={formData.assignedToId}
                onChange={(e) =>
                  setFormData({ ...formData, assignedToId: e.target.value })
                }
                className="w-full h-9 rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary"
              >
                <option value="">Chưa phân công</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.fullName} ({emp.username})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
}

