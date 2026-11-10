import * as React from "react";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ClipboardList, Clock, CheckCircle2 } from "lucide-react";

export default function EmployeeDashboardPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Bàn làm việc nhân viên"
        description="Khu vực dành cho thợ cơ khí theo dõi các đơn hàng được phân công và cập nhật tiến độ."
      />

      {/* Overview Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          title="Việc được giao"
          value="0"
          description="Đơn chờ nhận phôi"
          icon={ClipboardList}
        />
        <StatCard
          title="Đang gia công"
          value="0"
          description="Đang đứng máy"
          icon={Clock}
        />
        <StatCard
          title="Đã xong tuần này"
          value="0"
          description="Sản phẩm hoàn thành"
          icon={CheckCircle2}
        />
      </div>

      {/* Main Assigned Work List */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách việc cần thực hiện</CardTitle>
          <CardDescription>
            Đơn hàng và chi tiết gia công được giao cho bạn
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={ClipboardList}
            title="Chưa có đầu việc nào được phân công"
            description="Khi quản lý phân công đơn hàng gia công, chi tiết bản vẽ và vật tư sẽ xuất hiện tại đây."
          />
        </CardContent>
      </Card>
    </div>
  );
}

