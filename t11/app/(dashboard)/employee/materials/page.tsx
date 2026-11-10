import * as React from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { Boxes } from "lucide-react";

export default function EmployeeMaterialsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Tra cứu tồn kho nguyên vật liệu"
        description="Kiểm tra số lượng phôi, sắt thép và que hàn thực tế trong xưởng."
      >
        <Badge variant="neutral">Kế hoạch triển khai: Phase 3</Badge>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle>Tồn kho khả dụng</CardTitle>
          <CardDescription>
            Nhân viên chỉ xem số lượng tồn và đơn vị tính, không xem đơn giá hoặc giá trị nhập.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={Boxes}
            title="Chưa có dữ liệu tồn kho"
            description="Phân hệ tra cứu vật tư cho thợ xưởng sẽ được kích hoạt tại Phase 3."
          />
        </CardContent>
      </Card>
    </div>
  );
}

