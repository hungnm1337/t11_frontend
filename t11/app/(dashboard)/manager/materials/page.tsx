import * as React from "react";
import { Suspense } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Skeleton } from "@/components/ui/skeleton";
import { MaterialTable } from "@/components/materials/material-table";
import { getMaterials, getMaterialCategories } from "@/services/materialService";
import { formatVND } from "@/lib/utils";
import { AlertTriangle, Coins, Layers } from "lucide-react";

export const metadata = {
  title: "Quản lý nguyên vật liệu - Xưởng cơ khí",
  description: "Theo dõi danh mục, số lượng tồn kho, định mức tối thiểu và cảnh báo thiếu hụt vật tư.",
};

// Next.js 16: Disables blocking prerender warning for this dynamic data route
export const instant = false;

async function MaterialsContent() {
  const [materialsRes, categoriesRes] = await Promise.all([
    getMaterials({ page: 1, limit: 10 }),
    getMaterialCategories(),
  ]);

  const materials = materialsRes.data;
  const pagination = materialsRes.pagination;
  const categories = categoriesRes.data;

  // Overview quick stats
  const totalItems = pagination.total;
  const lowStockCount = materials.filter((m) => m.isLowStock).length;
  const totalValue = materials.reduce(
    (sum, m) => sum + m.quantity * m.unitPrice,
    0
  );

  return (
    <>


      {/* Materials Table with search, filter, CRUD modals */}
      <MaterialTable
        initialMaterials={materials}
        initialPagination={pagination}
        categories={categories}
      />
    </>
  );
}

function MaterialsLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
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

export default function ManagerMaterialsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý nguyên vật liệu & Tồn kho"
        description="Quản lý danh mục sắt, thép, inox, que hàn, vật tư cơ khí và cảnh báo thiếu hụt tự động."
      />

      <Suspense fallback={<MaterialsLoadingSkeleton />}>
        <MaterialsContent />
      </Suspense>
    </div>
  );
}
