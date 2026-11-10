import { ActivityLog } from "@/types";
import { MOCK_USERS } from "./users";

export const MOCK_ACTIVITY_LOGS: ActivityLog[] = [
  {
    id: "act-001",
    userId: "usr-001",
    action: "CREATE_ORDER",
    entityType: "ORDER",
    entityId: "ord-002",
    description: "Tạo mới đơn hàng DH-2026-002: Chế tạo bồn chứa dầu diesel 500L",
    createdAt: "2026-11-05T09:15:00Z",
  },
  {
    id: "act-002",
    userId: "usr-002",
    action: "UPDATE_STATUS",
    entityType: "ORDER",
    entityId: "ord-001",
    description: "Cập nhật tiến độ đơn hàng DH-2026-001 sang trạng thái Đang sản xuất",
    createdAt: "2026-11-03T13:30:00Z",
  },
  {
    id: "act-003",
    userId: "usr-001",
    action: "IMPORT_INVENTORY",
    entityType: "INVENTORY_TRANSACTION",
    entityId: "txn-007",
    description: "Nhập kho 15 hộp que hàn KT-421 từ Kim Tín Group",
    createdAt: "2026-11-06T15:00:00Z",
  },
  {
    id: "act-004",
    userId: "usr-004",
    action: "EXPORT_INVENTORY",
    entityType: "INVENTORY_TRANSACTION",
    entityId: "txn-006",
    description: "Xuất kho 420kg thép tấm SS400 phục vụ cắt bản mã dầm",
    createdAt: "2026-11-03T10:00:00Z",
  },
  {
    id: "act-005",
    userId: "usr-005",
    action: "COMPLETE_ORDER",
    entityType: "ORDER",
    entityId: "ord-005",
    description: "Hoàn thành gia công 45m lan can thép hộp nhà xưởng Long Hậu",
    createdAt: "2026-11-02T15:30:00Z",
  },
  {
    id: "act-006",
    userId: "usr-001",
    action: "ADJUST_INVENTORY",
    entityType: "INVENTORY_TRANSACTION",
    entityId: "txn-008",
    description: "Điều chỉnh kiểm kê dôi dư 5kg thép C45 phi 30mm",
    createdAt: "2026-11-07T16:00:00Z",
  },
].map((item) => {
  const user = MOCK_USERS.find((u) => u.id === item.userId);
  return {
    ...item,
    user: user
      ? { id: user.id, fullName: user.fullName, role: user.role }
      : undefined,
  };
});

