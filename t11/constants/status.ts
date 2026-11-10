import { OrderStatus, InventoryTransactionType, UserRole } from "@/types";

export const ORDER_STATUS_CONFIG: Record<
  OrderStatus,
  {
    label: string;
    variant: "default" | "primary" | "secondary" | "success" | "warning" | "danger" | "info";
    badgeClass: string;
    description: string;
  }
> = {
  PENDING: {
    label: "Chờ xử lý",
    variant: "warning",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
    description: "Đơn hàng mới tạo, đang chờ phê duyệt hoặc phân công.",
  },
  CONFIRMED: {
    label: "Đã xác nhận",
    variant: "info",
    badgeClass: "bg-sky-50 text-sky-700 border-sky-200",
    description: "Đơn hàng đã được xác nhận vật tư và lên kế hoạch sản xuất.",
  },
  IN_PROGRESS: {
    label: "Đang sản xuất",
    variant: "primary",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
    description: "Đang trong quá trình gia công và chế tạo tại xưởng.",
  },
  COMPLETED: {
    label: "Hoàn thành",
    variant: "success",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    description: "Đã gia công hoàn tất, chờ khách hàng nghiệm thu hoặc giao.",
  },
  DELIVERED: {
    label: "Đã bàn giao",
    variant: "secondary",
    badgeClass: "bg-slate-100 text-slate-700 border-slate-300",
    description: "Đã giao hàng và bàn giao thành công cho khách hàng.",
  },
  CANCELLED: {
    label: "Đã hủy",
    variant: "danger",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
    description: "Đơn hàng đã hủy bỏ do khách hoặc điều kiện kỹ thuật.",
  },
};

export const INVENTORY_TRANSACTION_TYPE_CONFIG: Record<
  InventoryTransactionType,
  {
    label: string;
    prefix: string;
    badgeClass: string;
    sign: "+" | "-" | "~";
  }
> = {
  IMPORT: {
    label: "Nhập kho",
    prefix: "NK",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    sign: "+",
  },
  EXPORT: {
    label: "Xuất kho",
    prefix: "XK",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
    sign: "-",
  },
  ADJUSTMENT: {
    label: "Điều chỉnh",
    prefix: "DC",
    badgeClass: "bg-indigo-50 text-indigo-700 border-indigo-200",
    sign: "~",
  },
};

export const ROLE_CONFIG: Record<
  UserRole,
  {
    label: string;
    badgeClass: string;
  }
> = {
  MANAGER: {
    label: "Quản lý xưởng",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200 font-medium",
  },
  EMPLOYEE: {
    label: "Nhân viên kỹ thuật",
    badgeClass: "bg-slate-100 text-slate-700 border-slate-300 font-medium",
  },
};

