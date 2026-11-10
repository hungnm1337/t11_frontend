import {
  Material,
  MaterialFilterParams,
  MaterialWithCategory,
  MaterialCategory,
  PaginatedResponse,
  ApiResponse,
} from "@/types";
import { API_CONFIG, simulateDelay } from "./apiConfig";
import {
  MOCK_MATERIALS,
  MOCK_CATEGORIES,
} from "@/mock";

let materialsState: Material[] = [...MOCK_MATERIALS];

function populateMaterialWithCategory(material: Material): MaterialWithCategory {
  const category =
    MOCK_CATEGORIES.find((c) => c.id === material.categoryId) || {
      id: material.categoryId,
      name: "Chưa phân loại",
      createdAt: material.createdAt,
    };

  return {
    ...material,
    category,
    isLowStock: material.quantity <= material.minQuantity,
  };
}

/**
 * Get paginated list of materials with filters (search, category, lowStockOnly).
 */
export async function getMaterials(
  params: MaterialFilterParams = {}
): Promise<PaginatedResponse<MaterialWithCategory>> {
  if (API_CONFIG.useMock) {
    await simulateDelay();

    const {
      page = 1,
      limit = 10,
      search = "",
      categoryId,
      lowStockOnly = false,
    } = params;

    let filtered = materialsState.map(populateMaterialWithCategory);

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter(
        (m) =>
          m.materialCode.toLowerCase().includes(q) ||
          m.name.toLowerCase().includes(q) ||
          (m.supplier && m.supplier.toLowerCase().includes(q))
      );
    }

    if (categoryId && categoryId !== "ALL") {
      filtered = filtered.filter((m) => m.categoryId === categoryId);
    }

    if (lowStockOnly) {
      filtered = filtered.filter((m) => m.isLowStock);
    }

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

  const res = await fetch(`${API_CONFIG.baseUrl}/materials?${query}`);
  if (!res.ok) throw new Error("Không thể tải danh sách nguyên vật liệu");
  return res.json();
}

/**
 * Get single material by ID or SKU.
 */
export async function getMaterialById(
  id: string
): Promise<ApiResponse<MaterialWithCategory | null>> {
  if (API_CONFIG.useMock) {
    await simulateDelay();

    const found = materialsState.find(
      (m) => m.id === id || m.materialCode === id
    );
    if (!found) {
      return {
        success: false,
        data: null,
        error: "Không tìm thấy nguyên vật liệu",
      };
    }

    return {
      success: true,
      data: populateMaterialWithCategory(found),
    };
  }

  const res = await fetch(`${API_CONFIG.baseUrl}/materials/${id}`);
  if (!res.ok) throw new Error("Không thể tải chi tiết nguyên vật liệu");
  return res.json();
}

/**
 * Get all material categories.
 */
export async function getMaterialCategories(): Promise<
  ApiResponse<MaterialCategory[]>
> {
  if (API_CONFIG.useMock) {
    await simulateDelay(50);
    return {
      success: true,
      data: MOCK_CATEGORIES,
    };
  }

  const res = await fetch(`${API_CONFIG.baseUrl}/categories`);
  if (!res.ok) throw new Error("Không thể tải danh mục nguyên vật liệu");
  return res.json();
}

/**
 * Get list of materials that reached or fell below minimum stock thresholds.
 */
export async function getLowStockMaterials(): Promise<
  ApiResponse<MaterialWithCategory[]>
> {
  if (API_CONFIG.useMock) {
    await simulateDelay(80);
    const lowStock = materialsState
      .map(populateMaterialWithCategory)
      .filter((m) => m.isLowStock);
    return {
      success: true,
      data: lowStock,
    };
  }

  const res = await fetch(`${API_CONFIG.baseUrl}/materials/low-stock`);
  if (!res.ok) throw new Error("Không thể tải danh sách vật tư cảnh báo");
  return res.json();
}

export interface CreateMaterialPayload {
  materialCode: string;
  name: string;
  categoryId: string;
  unit: string;
  quantity: number;
  minQuantity: number;
  unitPrice: number;
  supplier?: string;
  description?: string;
}

/**
 * Create a new material.
 */
export async function createMaterial(
  payload: CreateMaterialPayload
): Promise<ApiResponse<MaterialWithCategory>> {
  if (payload.quantity < 0 || payload.minQuantity < 0) {
    return {
      success: false,
      data: null as unknown as MaterialWithCategory,
      error: "Số lượng và tồn kho tối thiểu không được âm",
    };
  }

  if (API_CONFIG.useMock) {
    await simulateDelay();

    // Check code duplication
    const exists = materialsState.some(
      (m) => m.materialCode.toLowerCase() === payload.materialCode.trim().toLowerCase()
    );
    if (exists) {
      return {
        success: false,
        data: null as unknown as MaterialWithCategory,
        error: "Mã nguyên vật liệu đã tồn tại",
      };
    }

    const now = new Date().toISOString();
    const newMaterial: Material = {
      id: `mat-${Date.now()}`,
      materialCode: payload.materialCode.trim().toUpperCase(),
      name: payload.name.trim(),
      categoryId: payload.categoryId,
      unit: payload.unit.trim(),
      quantity: Number(payload.quantity) || 0,
      minQuantity: Number(payload.minQuantity) || 0,
      unitPrice: Number(payload.unitPrice) || 0,
      supplier: payload.supplier?.trim() || null,
      description: payload.description?.trim() || null,
      createdAt: now,
      updatedAt: now,
    };

    materialsState.unshift(newMaterial);

    return {
      success: true,
      data: populateMaterialWithCategory(newMaterial),
      message: "Thêm nguyên vật liệu thành công",
    };
  }

  const res = await fetch(`${API_CONFIG.baseUrl}/materials`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Không thể tạo nguyên vật liệu");
  return res.json();
}

/**
 * Update an existing material.
 */
export async function updateMaterial(
  id: string,
  payload: Partial<CreateMaterialPayload>
): Promise<ApiResponse<MaterialWithCategory>> {
  if (
    (payload.quantity !== undefined && payload.quantity < 0) ||
    (payload.minQuantity !== undefined && payload.minQuantity < 0)
  ) {
    return {
      success: false,
      data: null as unknown as MaterialWithCategory,
      error: "Số lượng không được âm",
    };
  }

  if (API_CONFIG.useMock) {
    await simulateDelay();

    const index = materialsState.findIndex((m) => m.id === id);
    if (index === -1) {
      return {
        success: false,
        data: null as unknown as MaterialWithCategory,
        error: "Không tìm thấy nguyên vật liệu",
      };
    }

    const current = materialsState[index];
    const updated: Material = {
      ...current,
      ...payload,
      quantity: payload.quantity !== undefined ? Number(payload.quantity) : current.quantity,
      minQuantity: payload.minQuantity !== undefined ? Number(payload.minQuantity) : current.minQuantity,
      unitPrice: payload.unitPrice !== undefined ? Number(payload.unitPrice) : current.unitPrice,
      updatedAt: new Date().toISOString(),
    };

    materialsState[index] = updated;

    return {
      success: true,
      data: populateMaterialWithCategory(updated),
      message: "Cập nhật nguyên vật liệu thành công",
    };
  }

  const res = await fetch(`${API_CONFIG.baseUrl}/materials/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Không thể cập nhật nguyên vật liệu");
  return res.json();
}
