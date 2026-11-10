import {
  InventoryTransaction,
  InventoryTransactionWithRelations,
  InventoryFilterParams,
  PaginatedResponse,
  ApiResponse,
} from "@/types";
import { API_CONFIG, simulateDelay } from "./apiConfig";
import {
  MOCK_INVENTORY_TRANSACTIONS,
  MOCK_MATERIALS,
  MOCK_ORDERS,
  MOCK_USERS,
} from "@/mock";

let transactionsState: InventoryTransaction[] = [...MOCK_INVENTORY_TRANSACTIONS];

function populateTransactionRelations(
  txn: InventoryTransaction
): InventoryTransactionWithRelations {
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
}

/**
 * Get paginated inventory transactions.
 */
export async function getInventoryTransactions(
  params: InventoryFilterParams = {}
): Promise<PaginatedResponse<InventoryTransactionWithRelations>> {
  if (API_CONFIG.useMock) {
    await simulateDelay();

    const {
      page = 1,
      limit = 10,
      search = "",
      type = "ALL",
      materialId,
    } = params;

    let filtered = transactionsState.map(populateTransactionRelations);

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter(
        (t) =>
          t.transactionCode.toLowerCase().includes(q) ||
          t.material.name.toLowerCase().includes(q) ||
          t.material.materialCode.toLowerCase().includes(q) ||
          (t.note && t.note.toLowerCase().includes(q))
      );
    }

    if (type && type !== "ALL") {
      filtered = filtered.filter((t) => t.type === type);
    }

    if (materialId) {
      filtered = filtered.filter((t) => t.materialId === materialId);
    }

    // Sort by latest created date first
    filtered.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const total = filtered.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginatedData = filtered.slice(startIndex, startIndex + limit);

    return {
      success: true,
      data: paginatedData,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  const query = new URLSearchParams(
    Object.entries(params).reduce<Record<string, string>>((acc, [k, v]) => {
      if (v !== undefined && v !== null) acc[k] = String(v);
      return acc;
    }, {})
  ).toString();

  const res = await fetch(`${API_CONFIG.baseUrl}/inventory?${query}`);
  if (!res.ok) throw new Error("Không thể tải lịch sử nhập xuất kho");
  return res.json();
}

/**
 * Record a new inventory transaction (Import, Export, Adjustment).
 */
export async function createInventoryTransaction(payload: {
  materialId: string;
  type: "IMPORT" | "EXPORT" | "ADJUSTMENT";
  quantity: number;
  unitPrice?: number;
  note?: string;
  orderId?: string | null;
  performedById?: string;
}): Promise<ApiResponse<InventoryTransactionWithRelations>> {
  if (API_CONFIG.useMock) {
    await simulateDelay();

    const prefix =
      payload.type === "IMPORT" ? "NK" : payload.type === "EXPORT" ? "XK" : "DC";
    const now = new Date().toISOString();
    const newTxn: InventoryTransaction = {
      id: `txn-${Date.now()}`,
      transactionCode: `${prefix}-2026-${String(transactionsState.length + 1).padStart(3, "0")}`,
      materialId: payload.materialId,
      orderId: payload.orderId || null,
      type: payload.type,
      quantity: payload.quantity,
      unitPrice: payload.unitPrice ?? null,
      note: payload.note || null,
      performedById: payload.performedById || "usr-001",
      createdAt: now,
    };

    transactionsState.unshift(newTxn);

    // Update in-memory material quantity
    const matIndex = MOCK_MATERIALS.findIndex((m) => m.id === payload.materialId);
    if (matIndex !== -1) {
      if (payload.type === "IMPORT") {
        MOCK_MATERIALS[matIndex].quantity += payload.quantity;
      } else if (payload.type === "EXPORT") {
        MOCK_MATERIALS[matIndex].quantity -= payload.quantity;
      } else if (payload.type === "ADJUSTMENT") {
        MOCK_MATERIALS[matIndex].quantity = payload.quantity;
      }
    }

    return {
      success: true,
      data: populateTransactionRelations(newTxn),
      message: "Tạo giao dịch kho thành công",
    };
  }

  const res = await fetch(`${API_CONFIG.baseUrl}/inventory`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Không thể tạo phiếu kho");
  return res.json();
}

