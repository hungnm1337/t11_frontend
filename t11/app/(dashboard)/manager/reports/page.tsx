import * as React from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { BarChart3 } from "lucide-react";

export default function ManagerReportsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Báo cáo & Thống kê"
        description="Thống kê hiệu suất gia công, giá trị luân chuyển kho và chi phí nguyên vật liệu."
      >
        <Badge variant="neutral">Kế hoạch triển khai: Phase 6</Badge>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle>Báo cáo tổng hợp</CardTitle>
          <CardDescription>
            Báo cáo thống kê thực từ cơ sở dữ liệu và biểu đồ Recharts sẽ được tích hợp tại Phase 6.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={BarChart3}
            title="Chưa có dữ liệu báo cáo"
            description="Phân hệ phân tích và trực quan hóa dữ liệu sẽ được triển khai ở Phase 6."
          />
        </CardContent>
      </Card>
    </div>
  );
}

