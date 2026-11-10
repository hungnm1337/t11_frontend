import {
  Order,
  OrderFilterParams,
  OrderWithRelations,
  PaginatedResponse,
  ApiResponse,
  OrderStatus,
} from "@/types";
import { API_CONFIG, simulateDelay } from "./apiConfig";
import {
  MOCK_ORDERS,
  MOCK_USERS,
  MOCK_ORDER_STATUS_HISTORIES,
  getOrderMaterialsDetail,
} from "@/mock";

// In-memory state for mock mutation testing during dev
let ordersState: Order[] = [...MOCK_ORDERS];
let orderStatusHistoriesState = [...MOCK_ORDER_STATUS_HISTORIES];

function populateOrderRelations(order: Order): OrderWithRelations {
  const assignedTo = order.assignedToId
    ? MOCK_USERS.find((u) => u.id === order.assignedToId) || null
    : null;
  const createdBy =
    MOCK_USERS.find((u) => u.id === order.createdById) || {
      id: order.createdById,
      fullName: "Quản trị viên",
    };
  const materials = getOrderMaterialsDetail(order.id);
  const statusHistories = orderStatusHistoriesState
    .filter((h) => h.orderId === order.id)
    .map((h) => {
      const user = MOCK_USERS.find((u) => u.id === h.changedById);
      return {
        ...h,
        changedBy: user ? { id: user.id, fullName: user.fullName } : undefined,
      };
    })
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  return {
    ...order,
    assignedTo: assignedTo
      ? {
          id: assignedTo.id,
          fullName: assignedTo.fullName,
          phone: assignedTo.phone,
        }
      : null,
    createdBy: {
      id: createdBy.id,
      fullName: createdBy.fullName,
    },
    materials,
    statusHistories,
  };
}

/**
 * Get paginated and filtered list of orders.
 */
export async function getOrders(
  params: OrderFilterParams = {}
): Promise<PaginatedResponse<OrderWithRelations>> {
  if (API_CONFIG.useMock) {
    await simulateDelay();

    const {
      page = 1,
      limit = 10,
      search = "",
      status = "ALL",
      assignedToId,
    } = params;

    let filtered = ordersState.map(populateOrderRelations);

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter(
        (o) =>
          o.orderCode.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.customerPhone.includes(q) ||
          o.description.toLowerCase().includes(q)
      );
    }

    if (status && status !== "ALL") {
      filtered = filtered.filter((o) => o.status === status);
    }

    if (assignedToId) {
      filtered = filtered.filter((o) => o.assignedToId === assignedToId);
    }

    // Sort by latest created first
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

  // Real API implementation
  const query = new URLSearchParams(
    Object.entries(params).reduce<Record<string, string>>((acc, [k, v]) => {
      if (v !== undefined && v !== null) acc[k] = String(v);
      return acc;
    }, {})
  ).toString();

  const res = await fetch(`${API_CONFIG.baseUrl}/orders?${query}`);
  if (!res.ok) throw new Error("Không thể tải danh sách đơn hàng");
  return res.json();
}

/**
 * Get detailed information of a single order by ID.
 */
export async function getOrderById(
  id: string
): Promise<ApiResponse<OrderWithRelations | null>> {
  if (API_CONFIG.useMock) {
    await simulateDelay();

    const found = ordersState.find((o) => o.id === id || o.orderCode === id);
    if (!found) {
      return {
        success: false,
        data: null,
        error: "Không tìm thấy đơn hàng",
      };
    }

    return {
      success: true,
      data: populateOrderRelations(found),
    };
  }

  const res = await fetch(`${API_CONFIG.baseUrl}/orders/${id}`);
  if (!res.ok) throw new Error("Không thể tải chi tiết đơn hàng");
  return res.json();
}

export interface CreateOrderPayload {
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  description: string;
  quantity: number;
  startDate?: string;
  expectedDate: string;
  assignedToId?: string;
  createdById?: string;
}

/**
 * Create a new order.
 */
export async function createOrder(
  payload: CreateOrderPayload
): Promise<ApiResponse<OrderWithRelations>> {
  if (payload.quantity <= 0) {
    return {
      success: false,
      data: null as unknown as OrderWithRelations,
      error: "Số lượng sản phẩm gia công phải lớn hơn 0",
    };
  }

  if (API_CONFIG.useMock) {
    await simulateDelay();

    const now = new Date().toISOString();
    const orderIndex = ordersState.length + 1;
    const orderCode = `DH-2026-${String(orderIndex).padStart(3, "0")}`;
    const newOrderId = `ord-${Date.now()}`;

    const newOrder: Order = {
      id: newOrderId,
      orderCode,
      customerName: payload.customerName.trim(),
      customerPhone: payload.customerPhone.trim(),
      customerAddress: payload.customerAddress?.trim() || null,
      description: payload.description.trim(),
      quantity: Number(payload.quantity) || 1,
      startDate: payload.startDate || now,
      expectedDate: payload.expectedDate,
      completedDate: null,
      status: "PENDING",
      assignedToId: payload.assignedToId || null,
      createdById: payload.createdById || "usr-001",
      createdAt: now,
      updatedAt: now,
    };

    ordersState.unshift(newOrder);

    // Initial status history
    orderStatusHistoriesState.push({
      id: `osh-${Date.now()}`,
      orderId: newOrderId,
      oldStatus: null,
      newStatus: "PENDING",
      changedById: payload.createdById || "usr-001",
      note: "Khởi tạo đơn hàng mới",
      createdAt: now,
    });

    return {
      success: true,
      data: populateOrderRelations(newOrder),
      message: "Tạo đơn hàng thành công",
    };
  }

  const res = await fetch(`${API_CONFIG.baseUrl}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Không thể tạo đơn hàng");
  return res.json();
}

/**
 * Update order status with history tracking.
 */
export async function updateOrderStatus(
  id: string,
  newStatus: OrderStatus,
  note?: string,
  changedById: string = "usr-001"
): Promise<ApiResponse<OrderWithRelations>> {
  if (API_CONFIG.useMock) {
    await simulateDelay();

    const index = ordersState.findIndex((o) => o.id === id);
    if (index === -1) {
      return {
        success: false,
        data: null as unknown as OrderWithRelations,
        error: "Đơn hàng không tồn tại",
      };
    }

    const current = ordersState[index];
    const oldStatus = current.status;
    const now = new Date().toISOString();

    const updatedOrder: Order = {
      ...current,
      status: newStatus,
      completedDate:
        newStatus === "COMPLETED" || newStatus === "DELIVERED"
          ? now
          : current.completedDate,
      updatedAt: now,
    };

    ordersState[index] = updatedOrder;

    orderStatusHistoriesState.push({
      id: `osh-${Date.now()}`,
      orderId: id,
      oldStatus,
      newStatus,
      changedById,
      note: note || `Cập nhật trạng thái sang ${newStatus}`,
      createdAt: now,
    });

    return {
      success: true,
      data: populateOrderRelations(updatedOrder),
      message: "Cập nhật trạng thái đơn hàng thành công",
    };
  }

  const res = await fetch(`${API_CONFIG.baseUrl}/orders/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: newStatus, note, changedById }),
  });
  if (!res.ok) throw new Error("Không thể cập nhật trạng thái đơn hàng");
  return res.json();
}
