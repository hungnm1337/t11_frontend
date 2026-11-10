import * as React from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { ArrowLeftRight } from "lucide-react";

export default function ManagerInventoryPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý nhập / xuất kho"
        description="Ghi nhận giao dịch nhập hàng từ nhà cung cấp, xuất kho sản xuất và điều chỉnh kiểm kê."
      >
        <Badge variant="neutral">Kế hoạch triển khai: Phase 4</Badge>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle>Lịch sử giao dịch kho</CardTitle>
          <CardDescription>
            Bảng InventoryTransaction với cơ chế Prisma Transaction chống race condition và xuất âm sẽ kích hoạt ở Phase 4.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={ArrowLeftRight}
            title="Chưa phát sinh giao dịch kho"
            description="Phân hệ nhập/xuất kho với database transaction an toàn sẽ được hoàn thiện trong Phase 4."
          />
        </CardContent>
      </Card>
    </div>
  );
}

