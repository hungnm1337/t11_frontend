import { User } from "@/types";

export const MOCK_USERS: User[] = [
  {
    id: "usr-001",
    fullName: "Nguyễn Văn An",
    username: "manager.an",
    email: "an.nguyen@xuongcokhi.vn",
    phone: "0903123456",
    role: "MANAGER",
    isActive: true,
    createdAt: "2026-01-10T08:00:00Z",
    updatedAt: "2026-01-10T08:00:00Z",
  },
  {
    id: "usr-002",
    fullName: "Trần Minh Tuấn",
    username: "tuan.tm",
    email: "tuan.tm@xuongcokhi.vn",
    phone: "0912345678",
    role: "EMPLOYEE",
    isActive: true,
    createdAt: "2026-02-15T08:30:00Z",
    updatedAt: "2026-02-15T08:30:00Z",
  },
  {
    id: "usr-003",
    fullName: "Lê Văn Hoàng",
    username: "hoang.lv",
    email: "hoang.lv@xuongcokhi.vn",
    phone: "0934567890",
    role: "EMPLOYEE",
    isActive: true,
    createdAt: "2026-03-01T09:00:00Z",
    updatedAt: "2026-03-01T09:00:00Z",
  },
  {
    id: "usr-004",
    fullName: "Phạm Quốc Đạt",
    username: "dat.pq",
    email: "dat.pq@xuongcokhi.vn",
    phone: "0987654321",
    role: "EMPLOYEE",
    isActive: true,
    createdAt: "2026-03-20T08:00:00Z",
    updatedAt: "2026-03-20T08:00:00Z",
  },
  {
    id: "usr-005",
    fullName: "Vũ Đình Trọng",
    username: "trong.vd",
    email: "trong.vd@xuongcokhi.vn",
    phone: "0971122334",
    role: "EMPLOYEE",
    isActive: true,
    createdAt: "2026-04-10T08:00:00Z",
    updatedAt: "2026-04-10T08:00:00Z",
  },
];

export const CURRENT_MOCK_USER = MOCK_USERS[0]; // Manager An as default active user

