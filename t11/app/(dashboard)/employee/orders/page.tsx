import * as React from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { ClipboardList } from "lucide-react";

export default function EmployeeOrdersPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Đơn hàng được phân công"
        description="Danh sách các chi tiết gia công cơ khí được giao trực tiếp cho bạn thực hiện."
      >
        <Badge variant="neutral">Kế hoạch triển khai: Phase 5</Badge>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle>Đơn hàng theo ca làm việc</CardTitle>
          <CardDescription>
            Nhân viên chỉ xem được đơn hàng được phân công phụ trách.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={ClipboardList}
            title="Chưa có đơn hàng được phân công"
            description="Khi quản lý gán thợ phụ trách, đơn hàng sẽ hiển thị tại đây."
          />
        </CardContent>
      </Card>
    </div>
  );
}

