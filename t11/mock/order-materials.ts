import { OrderMaterial, OrderMaterialDetail } from "@/types";
import { MOCK_MATERIALS } from "./materials";

export const MOCK_ORDER_MATERIALS: OrderMaterial[] = [
  // Đơn 1: Khung bàn sơ chế inox 304
  {
    id: "om-001",
    orderId: "ord-001",
    materialId: "mat-001", // Tấm Inox 304 2.0mm
    quantityRequired: 120, // kg
    quantityUsed: 120,
    createdAt: "2026-11-02T09:00:00Z",
  },
  {
    id: "om-002",
    orderId: "ord-001",
    materialId: "mat-008", // Đá cắt sắt Hải Dương
    quantityRequired: 3, // hộp
    quantityUsed: 2,
    createdAt: "2026-11-02T09:00:00Z",
  },

  // Đơn 2: Bồn chứa dầu 500L
  {
    id: "om-003",
    orderId: "ord-002",
    materialId: "mat-002", // Thép tấm SS400
    quantityRequired: 350, // kg
    quantityUsed: 0,
    createdAt: "2026-11-05T09:15:00Z",
  },
  {
    id: "om-004",
    orderId: "ord-002",
    materialId: "mat-006", // Que hàn KT-421
    quantityRequired: 4, // hộp
    quantityUsed: 0,
    createdAt: "2026-11-05T09:15:00Z",
  },

  // Đơn 3: Cắt CNC bản mã dầm thép
  {
    id: "om-005",
    orderId: "ord-003",
    materialId: "mat-002", // Thép tấm SS400
    quantityRequired: 420, // kg
    quantityUsed: 420,
    createdAt: "2026-11-03T08:00:00Z",
  },

  // Đơn 4: Trục truyền động C45
  {
    id: "om-006",
    orderId: "ord-004",
    materialId: "mat-005", // Thép tròn C45
    quantityRequired: 65, // kg
    quantityUsed: 65,
    createdAt: "2026-10-28T08:30:00Z",
  },

  // Đơn 5: Lan can thép hộp
  {
    id: "om-007",
    orderId: "ord-005",
    materialId: "mat-003", // Thép hộp 50x50
    quantityRequired: 18, // cây
    quantityUsed: 18,
    createdAt: "2026-10-15T08:30:00Z",
  },
  {
    id: "om-008",
    orderId: "ord-005",
    materialId: "mat-010", // Sơn chống rỉ Alkyd
    quantityRequired: 2, // thùng
    quantityUsed: 2,
    createdAt: "2026-10-15T08:30:00Z",
  },
];

export function getOrderMaterialsDetail(orderId: string): OrderMaterialDetail[] {
  return MOCK_ORDER_MATERIALS.filter((item) => item.orderId === orderId).map(
    (item) => {
      const material = MOCK_MATERIALS.find((m) => m.id === item.materialId) || {
        id: item.materialId,
        materialCode: "N/A",
        name: "Nguyên vật liệu không xác định",
        categoryId: "cat-001",
        unit: "kg",
        quantity: 0,
        minQuantity: 0,
        unitPrice: 0,
        createdAt: item.createdAt,
        updatedAt: item.createdAt,
      };
      return {
        ...item,
        material,
      };
    }
  );
}

