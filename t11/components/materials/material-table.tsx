"use client";

import * as React from "react";
import { MaterialCategory, MaterialWithCategory, PaginationMeta } from "@/types";
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
import { MaterialFormModal } from "./material-form-modal";
import { MaterialDetailModal } from "./material-detail-modal";
import { getMaterials } from "@/services/materialService";
import { formatVND } from "@/lib/utils";
import {
  Search,
  Filter,
  AlertTriangle,
  Plus,
  Eye,
  Pencil,
  Boxes,
  ChevronLeft,
  ChevronRight,
  RotateCw,
} from "lucide-react";

interface MaterialTableProps {
  initialMaterials: MaterialWithCategory[];
  initialPagination: PaginationMeta;
  categories: MaterialCategory[];
}

export function MaterialTable({
  initialMaterials,
  initialPagination,
  categories,
}: MaterialTableProps) {
  const [materials, setMaterials] = React.useState<MaterialWithCategory[]>(initialMaterials);
  const [pagination, setPagination] = React.useState<PaginationMeta>(initialPagination);
  const [isLoading, setIsLoading] = React.useState(false);

  // Filters state
  const [search, setSearch] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("ALL");
  const [lowStockOnly, setLowStockOnly] = React.useState(false);

  // Modal states
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingMaterial, setEditingMaterial] = React.useState<MaterialWithCategory | null>(null);
  const [viewingMaterial, setViewingMaterial] = React.useState<MaterialWithCategory | null>(null);

  const fetchMaterials = React.useCallback(
    async (page = 1) => {
      setIsLoading(true);
      try {
        const res = await getMaterials({
          page,
          limit: 10,
          search,
          categoryId: selectedCategory === "ALL" ? undefined : selectedCategory,
          lowStockOnly,
        });
        if (res.success) {
          setMaterials(res.data);
          setPagination(res.pagination);
        }
      } catch (err) {
        console.error("Lỗi khi tải danh sách vật liệu:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [search, selectedCategory, lowStockOnly]
  );

  // Re-fetch when category, lowStockOnly or search changes
  React.useEffect(() => {
    const timer = setTimeout(() => {
      fetchMaterials(1);
    }, 250);
    return () => clearTimeout(timer);
  }, [search, selectedCategory, lowStockOnly, fetchMaterials]);

  const handleOpenCreate = () => {
    setEditingMaterial(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (material: MaterialWithCategory) => {
    setEditingMaterial(material);
    setIsFormOpen(true);
  };

  const handleOpenDetail = (material: MaterialWithCategory) => {
    setViewingMaterial(material);
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
              placeholder="Tìm theo mã SKU, tên vật tư, nhà cung cấp..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-md border border-border bg-surface text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary"
            />
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-text-muted shrink-0" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-9 rounded-md border border-border bg-surface px-3 text-xs font-medium text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            >
              <option value="ALL">Tất cả danh mục</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Low Stock Toggle */}
          <label className="flex items-center gap-2 text-xs font-medium text-text-secondary cursor-pointer select-none px-2 py-1.5 rounded-md hover:bg-surface-muted transition-colors">
            <input
              type="checkbox"
              checked={lowStockOnly}
              onChange={(e) => setLowStockOnly(e.target.checked)}
              className="h-4 w-4 rounded border-border text-primary focus:ring-primary/20"
            />
            <span className={lowStockOnly ? "text-amber-700 font-semibold flex items-center gap-1" : ""}>
              <AlertTriangle className="h-3.5 w-3.5 text-amber-600 inline" />
              Chỉ hàng sắp hết
            </span>
          </label>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchMaterials(pagination.page)}
            title="Làm mới dữ liệu"
          >
            <RotateCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
          <Button variant="primary" size="sm" onClick={handleOpenCreate}>
            <Plus className="h-4 w-4 mr-1" />
            Thêm vật tư
          </Button>
        </div>
      </div>

      {/* Materials Table Card */}
      <div className="rounded-lg border border-border bg-surface shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-3">
            <div className="h-6 bg-surface-muted animate-pulse rounded w-1/4" />
            <div className="h-10 bg-surface-muted animate-pulse rounded" />
            <div className="h-10 bg-surface-muted animate-pulse rounded" />
            <div className="h-10 bg-surface-muted animate-pulse rounded" />
            <div className="h-10 bg-surface-muted animate-pulse rounded" />
          </div>
        ) : materials.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={Boxes}
              title="Không tìm thấy nguyên vật liệu nào"
              description="Thử thay đổi bộ lọc tìm kiếm hoặc thêm mới vật liệu vào kho xưởng."
              action={
                <Button variant="primary" size="sm" onClick={handleOpenCreate}>
                  <Plus className="h-4 w-4 mr-1" />
                  Thêm nguyên vật liệu
                </Button>
              }
            />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[140px]">Mã SKU</TableHead>
                <TableHead>Tên nguyên vật liệu</TableHead>
                <TableHead>Danh mục</TableHead>
                <TableHead className="text-right">Tồn kho / Min</TableHead>
                <TableHead>Tình trạng</TableHead>
                <TableHead className="text-right">Đơn giá nhập</TableHead>
                <TableHead>Nhà cung cấp</TableHead>
                <TableHead className="text-center w-[110px]">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {materials.map((mat) => {
                const isLow = mat.isLowStock;
                return (
                  <TableRow
                    key={mat.id}
                    className={isLow ? "bg-amber-50/20 hover:bg-amber-50/40" : ""}
                  >
                    <TableCell className="font-mono text-xs font-bold text-primary">
                      {mat.materialCode}
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-text-primary text-xs">
                        {mat.name}
                      </div>
                      {mat.description && (
                        <div className="text-[11px] text-text-muted line-clamp-1">
                          {mat.description}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-text-secondary">
                        {mat.category.name}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs">
                      <span className={isLow ? "text-danger font-bold" : "font-semibold"}>
                        {mat.quantity}
                      </span>
                      <span className="text-text-muted text-[11px]">
                        {" "}/ {mat.minQuantity} {mat.unit}
                      </span>
                    </TableCell>
                    <TableCell>
                      {isLow ? (
                        <Badge variant="warning" dot className="bg-amber-100 text-amber-900 border-amber-300">
                          Sắp hết
                        </Badge>
                      ) : (
                        <Badge variant="success" dot>
                          Đủ hàng
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs font-medium">
                      {formatVND(mat.unitPrice)}
                    </TableCell>
                    <TableCell className="text-xs text-text-secondary">
                      {mat.supplier || "—"}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenDetail(mat)}
                          className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-surface-muted transition-colors"
                          title="Xem chi tiết"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(mat)}
                          className="p-1 rounded text-text-muted hover:text-primary hover:bg-surface-muted transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                      </div>
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
                {materials.length}
              </span>{" "}
              trên tổng số{" "}
              <span className="font-semibold text-text-primary">
                {pagination.total}
              </span>{" "}
              vật tư
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page <= 1 || isLoading}
                onClick={() => fetchMaterials(pagination.page - 1)}
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
                onClick={() => fetchMaterials(pagination.page + 1)}
              >
                Sau
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Add / Edit */}
      <MaterialFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        categories={categories}
        initialData={editingMaterial}
        onSuccess={() => fetchMaterials(pagination.page)}
      />

      {/* Modal Detail */}
      <MaterialDetailModal
        isOpen={!!viewingMaterial}
        material={viewingMaterial}
        onClose={() => setViewingMaterial(null)}
        onEdit={(mat) => handleOpenEdit(mat)}
      />
    </div>
  );
}

