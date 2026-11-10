import { User, CurrentUser, ApiResponse } from "@/types";
import { API_CONFIG, simulateDelay } from "./apiConfig";
import { MOCK_USERS, CURRENT_MOCK_USER } from "@/mock";

/**
 * Get list of employees/users.
 */
export async function getEmployees(): Promise<ApiResponse<User[]>> {
  if (API_CONFIG.useMock) {
    await simulateDelay(60);
    return {
      success: true,
      data: MOCK_USERS,
    };
  }

  const res = await fetch(`${API_CONFIG.baseUrl}/employees`);
  if (!res.ok) throw new Error("Không thể tải danh sách nhân viên");
  return res.json();
}

/**
 * Get active session user (mocked as Manager or logged in user).
 */
export async function getCurrentUser(): Promise<ApiResponse<CurrentUser>> {
  if (API_CONFIG.useMock) {
    await simulateDelay(30);
    return {
      success: true,
      data: CURRENT_MOCK_USER,
    };
  }

  const res = await fetch(`${API_CONFIG.baseUrl}/auth/me`);
  if (!res.ok) throw new Error("Chưa đăng nhập");
  return res.json();
}

