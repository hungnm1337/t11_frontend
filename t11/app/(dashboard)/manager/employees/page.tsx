import * as React from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";

export default function ManagerEmployeesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý nhân viên & tài khoản"
        description="Danh sách thợ, kỹ thuật viên xưởng và phân quyền truy cập hệ thống."
      >
        <Badge variant="neutral">Kế hoạch triển khai: Phase 2</Badge>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách nhân sự xưởng</CardTitle>
          <CardDescription>
            Bảng User hỗ trợ 2 vai trò MANAGER và EMPLOYEE. Phân quyền và seed tài khoản sẽ hoàn thiện ở Phase 2.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={Users}
            title="Chưa kích hoạt quản lý tài khoản"
            description="Phân hệ xác thực Auth.js và quản lý phân quyền nhân viên sẽ được hoàn tất tại Phase 2."
          />
        </CardContent>
      </Card>
    </div>
  );
}

