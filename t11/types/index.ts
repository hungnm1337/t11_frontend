export type UserRole = "MANAGER" | "EMPLOYEE";

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "DELIVERED"
  | "CANCELLED";

export type InventoryTransactionType = "IMPORT" | "EXPORT" | "ADJUSTMENT";

// ==========================================
// Base Entities
// ==========================================

export interface User {
  id: string;
  fullName: string;
  username: string;
  email: string;
  phone?: string | null;
  role: UserRole;
  isActive: boolean;
  createdAt: string; // ISO date string
  updatedAt: string;
}

export type CurrentUser = Pick<
  User,
  "id" | "fullName" | "username" | "email" | "role" | "phone"
>;

export interface MaterialCategory {
  id: string;
  name: string;
  description?: string | null;
  createdAt: string;
}

export interface Material {
  id: string;
  materialCode: string;
  name: string;
  categoryId: string;
  unit: string;
  quantity: number;
  minQuantity: number;
  unitPrice: number;
  supplier?: string | null;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MaterialWithCategory extends Material {
  category: MaterialCategory;
  isLowStock?: boolean;
}

export interface Order {
  id: string;
  orderCode: string;
  customerName: string;
  customerPhone: string;
  customerAddress?: string | null;
  description: string;
  quantity: number;
  startDate: string;
  expectedDate: string;
  completedDate?: string | null;
  status: OrderStatus;
  assignedToId?: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderMaterial {
  id: string;
  orderId: string;
  materialId: string;
  quantityRequired: number;
  quantityUsed: number;
  createdAt: string;
}

export interface OrderMaterialDetail extends OrderMaterial {
  material: Material;
}

export interface OrderStatusHistory {
  id: string;
  orderId: string;
  oldStatus?: OrderStatus | null;
  newStatus: OrderStatus;
  changedById: string;
  changedBy?: Pick<User, "id" | "fullName">;
  note?: string | null;
  createdAt: string;
}

export interface OrderWithRelations extends Order {
  assignedTo?: Pick<User, "id" | "fullName" | "phone"> | null;
  createdBy: Pick<User, "id" | "fullName">;
  materials?: OrderMaterialDetail[];
  statusHistories?: OrderStatusHistory[];
}

export interface InventoryTransaction {
  id: string;
  transactionCode: string;
  materialId: string;
  orderId?: string | null;
  type: InventoryTransactionType;
  quantity: number;
  unitPrice?: number | null;
  note?: string | null;
  performedById: string;
  createdAt: string;
}

export interface InventoryTransactionWithRelations extends InventoryTransaction {
  material: Pick<Material, "id" | "materialCode" | "name" | "unit">;
  order?: Pick<Order, "id" | "orderCode" | "customerName"> | null;
  performedBy: Pick<User, "id" | "fullName">;
}

export interface ActivityLog {
  id: string;
  userId: string;
  user?: Pick<User, "id" | "fullName" | "role">;
  action: string;
  entityType: string;
  entityId: string;
  description?: string | null;
  createdAt: string;
}

// ==========================================
// Dashboard & Analytics
// ==========================================

export interface DashboardStats {
  totalOrders: number;
  inProgressOrders: number;
  completedOrders: number;
  overdueOrders: number;
  totalMaterials: number;
  totalInventoryValue: number;
  lowStockCount: number;
}

export interface MonthlyOrdersChartData {
  month: string;
  completed: number;
  inProgress: number;
  cancelled: number;
}

export interface OrderStatusDistribution {
  status: OrderStatus;
  label: string;
  count: number;
  color: string;
}

export interface InventoryFlowChartData {
  month: string;
  importValue: number;
  exportValue: number;
}

// ==========================================
// API & Query Interfaces
// ==========================================

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: PaginationMeta;
  message?: string;
}

export interface OrderFilterParams extends PaginationParams {
  search?: string;
  status?: OrderStatus | "ALL";
  assignedToId?: string;
  startDate?: string;
  endDate?: string;
}

export interface MaterialFilterParams extends PaginationParams {
  search?: string;
  categoryId?: string;
  lowStockOnly?: boolean;
}

export interface InventoryFilterParams extends PaginationParams {
  search?: string;
  type?: InventoryTransactionType | "ALL";
  materialId?: string;
  startDate?: string;
  endDate?: string;
}

// ==========================================
// Navigation & UI Types
// ==========================================

export interface NavItem {
  title: string;
  href: string;
  iconName: string;
  roles: UserRole[];
  badge?: string | number;
}
