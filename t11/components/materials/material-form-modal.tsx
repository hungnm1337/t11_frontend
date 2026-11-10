"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MaterialCategory, MaterialWithCategory } from "@/types";
import { createMaterial, updateMaterial, CreateMaterialPayload } from "@/services/materialService";

interface MaterialFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: MaterialCategory[];
  initialData?: MaterialWithCategory | null;
  onSuccess: () => void;
}

export function MaterialFormModal({
  isOpen,
  onClose,
  categories,
  initialData,
  onSuccess,
}: MaterialFormModalProps) {
  const isEdit = !!initialData;

  const [formData, setFormData] = React.useState<CreateMaterialPayload>({
    materialCode: "",
    name: "",
    categoryId: categories[0]?.id || "",
    unit: "kg",
    quantity: 0,
    minQuantity: 10,
    unitPrice: 0,
    supplier: "",
    description: "",
  });

  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [apiError, setApiError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (initialData) {
      setFormData({
        materialCode: initialData.materialCode,
        name: initialData.name,
        categoryId: initialData.categoryId,
        unit: initialData.unit,
        quantity: initialData.quantity,
        minQuantity: initialData.minQuantity,
        unitPrice: initialData.unitPrice,
        supplier: initialData.supplier || "",
        description: initialData.description || "",
      });
    } else {
      setFormData({
        materialCode: "",
        name: "",
        categoryId: categories[0]?.id || "",
        unit: "kg",
        quantity: 0,
        minQuantity: 10,
        unitPrice: 0,
        supplier: "",
        description: "",
      });
    }
    setErrors({});
    setApiError(null);
  }, [initialData, categories, isOpen]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.materialCode.trim()) {
      newErrors.materialCode = "Mã nguyên vật liệu (SKU) là bắt buộc";
    }
    if (!formData.name.trim()) {
      newErrors.name = "Tên nguyên vật liệu là bắt buộc";
    }
    if (!formData.categoryId) {
      newErrors.categoryId = "Vui lòng chọn danh mục";
    }
    if (!formData.unit.trim()) {
      newErrors.unit = "Đơn vị tính là bắt buộc";
    }
    if (formData.quantity < 0) {
      newErrors.quantity = "Số lượng không được âm";
    }
    if (formData.minQuantity < 0) {
      newErrors.minQuantity = "Tồn tối thiểu không được âm";
    }
    if (formData.unitPrice < 0) {
      newErrors.unitPrice = "Đơn giá không được âm";
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
      if (isEdit && initialData) {
        const res = await updateMaterial(initialData.id, formData);
        if (!res.success) {
          setApiError(res.error || "Không thể cập nhật nguyên vật liệu");
          return;
        }
      } else {
        const res = await createMaterial(formData);
        if (!res.success) {
          setApiError(res.error || "Không thể thêm nguyên vật liệu");
          return;
        }
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
      title={isEdit ? "Chỉnh sửa nguyên vật liệu" : "Thêm nguyên vật liệu mới"}
      description={
        isEdit
          ? `Cập nhật thông tin cho vật tư: ${initialData?.materialCode}`
          : "Nhập thông số kỹ thuật, quy cách và định mức tồn kho an toàn."
      }
      maxWidth="lg"
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
            {isEdit ? "Lưu thay đổi" : "Thêm vật tư"}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5 mg-5">
        {apiError && (
          <div className="p-3 text-xs rounded-md bg-rose-50 text-rose-700 border border-rose-200">
            {apiError}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Mã SKU *"
            placeholder="Ví dụ: MAT-INX-304"
            value={formData.materialCode}
            disabled={isEdit} // Mã SKU không đổi khi sửa
            error={errors.materialCode}
            onChange={(e) =>
              setFormData({ ...formData, materialCode: e.target.value })
            }
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-text-secondary">
              Danh mục *
            </label>
            <select
              value={formData.categoryId}
              onChange={(e) =>
                setFormData({ ...formData, categoryId: e.target.value })
              }
              className="w-full h-9 rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="text-xs text-danger">{errors.categoryId}</p>
            )}
          </div>
        </div>

        <Input
          label="Tên nguyên vật liệu *"
          placeholder="Ví dụ: Tấm Inox 304 dày 2.0mm (1220x2440)"
          value={formData.name}
          error={errors.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Đơn vị tính *"
            placeholder="kg, cây, tấm, hộp..."
            value={formData.unit}
            error={errors.unit}
            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
          />

          <Input
            label="Số lượng tồn *"
            type="number"
            min="0"
            step="any"
            value={formData.quantity}
            error={errors.quantity}
            onChange={(e) =>
              setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })
            }
          />

          <Input
            label="Tồn tối thiểu (Min) *"
            type="number"
            min="0"
            step="any"
            hint="Cảnh báo khi chạm mức này"
            value={formData.minQuantity}
            error={errors.minQuantity}
            onChange={(e) =>
              setFormData({
                ...formData,
                minQuantity: parseFloat(e.target.value) || 0,
              })
            }
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Đơn giá nhập tham khảo (VNĐ)"
            type="number"
            min="0"
            step="1000"
            placeholder="0"
            value={formData.unitPrice}
            error={errors.unitPrice}
            onChange={(e) =>
              setFormData({
                ...formData,
                unitPrice: parseFloat(e.target.value) || 0,
              })
            }
          />

          <Input
            label="Nhà cung cấp chính"
            placeholder="Ví dụ: Inox Hoàng Vũ, Thép Hòa Phát..."
            value={formData.supplier}
            onChange={(e) =>
              setFormData({ ...formData, supplier: e.target.value })
            }
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-text-secondary">
            Mô tả / Ghi chú quy cách kỹ thuật
          </label>
          <textarea
            rows={2}
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary placeholder:text-text-muted"
            placeholder="Tiêu chuẩn kỹ thuật, độ dày, dung sai, vị trí kệ kho..."
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />
        </div>
      </form>
    </Modal>
  );
}

