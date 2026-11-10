import { InventoryTransaction, InventoryTransactionWithRelations } from "@/types";
import { MOCK_MATERIALS } from "./materials";
import { MOCK_ORDERS } from "./orders";
import { MOCK_USERS } from "./users";

export const MOCK_INVENTORY_TRANSACTIONS: InventoryTransaction[] = [
  {
    id: "txn-001",
    transactionCode: "NK-2026-001",
    materialId: "mat-001", // Inox 304 2.0mm
    orderId: null,
    type: "IMPORT",
    quantity: 600,
    unitPrice: 82000,
    note: "Nhập lô tấm Inox 304 từ Hoàng Vũ theo hợp đồng HV-2026/01",
    performedById: "usr-001", // Nguyễn Văn An
    createdAt: "2026-10-20T09:00:00Z",
  },
  {
    id: "txn-002",
    transactionCode: "NK-2026-002",
    materialId: "mat-002", // Thép tấm SS400
    orderId: null,
    type: "IMPORT",
    quantity: 1870,
    unitPrice: 18500,
    note: "Nhập nguyên kiện thép tấm cán nóng Hòa Phát dầm xưởng",
    performedById: "usr-001",
    createdAt: "2026-10-22T10:30:00Z",
  },
  {
    id: "txn-003",
    transactionCode: "XK-2026-001",
    materialId: "mat-003", // Thép hộp 50x50
    orderId: "ord-005",
    type: "EXPORT",
    quantity: 18,
    unitPrice: 285000,
    note: "Xuất 18 cây thép hộp 50x50 gia công lan can kho Long Hậu",
    performedById: "usr-005", // Vũ Đình Trọng
    createdAt: "2026-10-23T14:00:00Z",
  },
  {
    id: "txn-004",
    transactionCode: "XK-2026-002",
    materialId: "mat-005", // Thép tròn C45
    orderId: "ord-004",
    type: "EXPORT",
    quantity: 65,
    unitPrice: 22500,
    note: "Xuất 65kg thép C45 tiện cụm trục máy ép gỗ Thành Đạt",
    performedById: "usr-004", // Phạm Quốc Đạt
    createdAt: "2026-10-29T08:45:00Z",
  },
  {
    id: "txn-005",
    transactionCode: "XK-2026-003",
    materialId: "mat-001", // Inox 304
    orderId: "ord-001",
    type: "EXPORT",
    quantity: 120,
    unitPrice: 82000,
    note: "Xuất nguyên vật liệu gia công bàn sơ chế inox Á Châu",
    performedById: "usr-002", // Trần Minh Tuấn
    createdAt: "2026-11-02T09:30:00Z",
  },
  {
    id: "txn-006",
    transactionCode: "XK-2026-004",
    materialId: "mat-002", // Thép SS400
    orderId: "ord-003",
    type: "EXPORT",
    quantity: 420,
    unitPrice: 18500,
    note: "Xuất cắt CNC bản mã kết cấu dầm Tân Phát",
    performedById: "usr-004", // Phạm Quốc Đạt
    createdAt: "2026-11-03T10:00:00Z",
  },
  {
    id: "txn-007",
    transactionCode: "NK-2026-003",
    materialId: "mat-006", // Que hàn KT-421
    orderId: null,
    type: "IMPORT",
    quantity: 15,
    unitPrice: 145000,
    note: "Nhập bổ sung que hàn Kim Tín chuẩn bị chế tạo bồn chứa dầu",
    performedById: "usr-001",
    createdAt: "2026-11-06T15:00:00Z",
  },
  {
    id: "txn-008",
    transactionCode: "DC-2026-001",
    materialId: "mat-005", // Thép tròn C45
    orderId: null,
    type: "ADJUSTMENT",
    quantity: 5,
    unitPrice: 22500,
    note: "Điều chỉnh số lượng kiểm kê định kỳ đầu tháng 11 (dôi dư 5kg do mạt cưa)",
    performedById: "usr-001",
    createdAt: "2026-11-07T16:00:00Z",
  },
];

export const MOCK_INVENTORY_WITH_RELATIONS: InventoryTransactionWithRelations[] =
  MOCK_INVENTORY_TRANSACTIONS.map((txn) => {
    const material = MOCK_MATERIALS.find((m) => m.id === txn.materialId) || {
      id: txn.materialId,
      materialCode: "N/A",
      name: "Nguyên vật liệu không xác định",
      unit: "N/A",
    };
    const order = txn.orderId
      ? MOCK_ORDERS.find((o) => o.id === txn.orderId) || null
      : null;
    const performedBy = MOCK_USERS.find((u) => u.id === txn.performedById) || {
      id: txn.performedById,
      fullName: "Hệ thống",
    };

    return {
      ...txn,
      material: {
        id: material.id,
        materialCode: material.materialCode,
        name: material.name,
        unit: material.unit,
      },
      order: order
        ? {
            id: order.id,
            orderCode: order.orderCode,
            customerName: order.customerName,
          }
        : null,
      performedBy: {
        id: performedBy.id,
        fullName: performedBy.fullName,
      },
    };
  });

