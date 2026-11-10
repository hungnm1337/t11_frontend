"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MaterialWithCategory } from "@/types";
import { formatVND, formatDate } from "@/lib/utils";
import { AlertTriangle, CheckCircle2, Building2, Package, Tag, Clock } from "lucide-react";

interface MaterialDetailModalProps {
  material: MaterialWithCategory | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (material: MaterialWithCategory) => void;
}

export function MaterialDetailModal({
  material,
  isOpen,
  onClose,
  onEdit,
}: MaterialDetailModalProps) {
  if (!material) return null;

  const totalValue = material.quantity * material.unitPrice;
  const isLow = material.quantity <= material.minQuantity;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Chi tiết nguyên vật liệu"
      description={`Mã quản lý: ${material.materialCode}`}
      maxWidth="lg"
      footer={
        <div className="flex items-center justify-between w-full">
          <span className="text-xs text-text-muted">
            Cập nhật lần cuối: {formatDate(material.updatedAt)}
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Đóng
            </Button>
            {onEdit && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  onClose();
                  onEdit(material);
                }}
              >
                Chỉnh sửa
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Main Header summary */}
        <div className="p-4 rounded-lg bg-surface-muted/60 border border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold text-sm text-text-primary">
              {material.name}
            </h3>
            <p className="text-xs text-text-secondary mt-0.5">
              Danh mục: <span className="font-medium">{material.category.name}</span>
            </p>
          </div>
          <div className="shrink-0">
            {isLow ? (
              <Badge variant="warning" dot className="bg-amber-100 text-amber-900 border-amber-300">
                <AlertTriangle className="h-3 w-3 mr-1 text-amber-600 inline" />
                Cảnh báo sắp hết
              </Badge>
            ) : (
              <Badge variant="success" dot>
                <CheckCircle2 className="h-3 w-3 mr-1 inline" />
                Tồn kho an toàn
              </Badge>
            )}
          </div>
        </div>

        {/* Quantities & Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-md border border-border bg-surface">
            <span className="text-[11px] text-text-muted uppercase tracking-wider block">
              Số lượng tồn
            </span>
            <span
              className={`text-lg font-bold font-mono ${
                isLow ? "text-danger" : "text-text-primary"
              }`}
            >
              {material.quantity} {material.unit}
            </span>
          </div>

          <div className="p-3 rounded-md border border-border bg-surface">
            <span className="text-[11px] text-text-muted uppercase tracking-wider block">
              Tồn tối thiểu
            </span>
            <span className="text-lg font-bold font-mono text-text-secondary">
              {material.minQuantity} {material.unit}
            </span>
          </div>

          <div className="p-3 rounded-md border border-border bg-surface">
            <span className="text-[11px] text-text-muted uppercase tracking-wider block">
              Đơn giá nhập
            </span>
            <span className="text-sm font-bold text-text-primary">
              {formatVND(material.unitPrice)}
            </span>
          </div>

          <div className="p-3 rounded-md border border-border bg-surface">
            <span className="text-[11px] text-text-muted uppercase tracking-wider block">
              Tổng giá trị tồn
            </span>
            <span className="text-sm font-bold text-primary">
              {formatVND(totalValue)}
            </span>
          </div>
        </div>

        {/* Technical Specs & Supplier */}
        <div className="space-y-3 pt-2 border-t border-border/60">
          <div className="flex items-start gap-3">
            <Building2 className="h-4 w-4 text-text-muted shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-medium text-text-secondary">
                Nhà cung cấp:
              </span>
              <p className="text-xs text-text-primary font-semibold">
                {material.supplier || "Chưa cập nhật thông tin nhà cung cấp"}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Tag className="h-4 w-4 text-text-muted shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-medium text-text-secondary">
                Quy cách kỹ thuật & Ghi chú:
              </span>
              <p className="text-xs text-text-primary mt-0.5 leading-relaxed bg-surface-muted/40 p-2.5 rounded-md border border-border/50">
                {material.description || "Không có ghi chú kỹ thuật đặc biệt."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

