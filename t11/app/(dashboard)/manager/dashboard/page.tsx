import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import {
  MASTER_DATA_DEFINITIONS,
  MASTER_DATA_RESOURCES,
} from "@/lib/master-data-definitions";

const DOCUMENT_PAGES = [
  {
    title: "Phiếu nhập",
    href: "/manager/receipts",
    description: "Tạo phiếu nhập cùng nhiều dòng vật tư.",
  },
  {
    title: "Phiếu điều chuyển",
    href: "/manager/transfers",
    description: "Điều chuyển vật tư giữa các kho.",
  },
];

export const metadata = {
  title: "Quản lý dữ liệu - Quản lý xưởng cơ khí",
};

export const instant = false;

export default function ManagerDashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý dữ liệu"
        description="Chọn danh mục hoặc nghiệp vụ để xem và quản lý dữ liệu từ API."
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {DOCUMENT_PAGES.map((page) => (
          <Link
            key={page.href}
            href={page.href}
            className="rounded-lg border border-border bg-surface p-5 transition-colors hover:border-primary hover:bg-surface-muted/40"
          >
            <h2 className="text-sm font-semibold text-text-primary">
              {page.title}
            </h2>
            <p className="mt-2 text-xs text-text-secondary">
              {page.description}
            </p>
          </Link>
        ))}
        {MASTER_DATA_RESOURCES.map((resource) => {
          const definition = MASTER_DATA_DEFINITIONS[resource];
          return (
            <Link
              key={resource}
              href={`/manager/master-data/${resource}`}
              className="rounded-lg border border-border bg-surface p-5 transition-colors hover:border-primary hover:bg-surface-muted/40"
            >
              <h2 className="text-sm font-semibold text-text-primary">
                {definition.label}
              </h2>
              <p className="mt-2 text-xs text-text-secondary">
                Xem, thêm, cập nhật hoặc xóa bản ghi.
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
