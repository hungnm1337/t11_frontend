/**
 * Global configuration for API client and mock data layer.
 * 
 * - When `NEXT_PUBLIC_USE_MOCK` is "false", services will call real API endpoints.
 * - By default (or when NEXT_PUBLIC_USE_MOCK is "true" or unset), it uses the local mock data.
 */
export const API_CONFIG = {
  useMock: process.env.NEXT_PUBLIC_USE_MOCK !== "false",
  baseUrl: process.env.NEXT_PUBLIC_API_URL || "/api",
  mockDelayMs: 100, // Small delay in ms on client-side to test loading skeletons
};

/**
 * Helper to simulate network latency in mock mode for testing client-side UI states.
 * Note: Never delays on the server (SSR / prerender) to avoid blocking rendering.
 */
export async function simulateDelay(ms: number = API_CONFIG.mockDelayMs): Promise<void> {
  if (typeof window === "undefined" || ms <= 0) {
    return;
  }
  return new Promise((resolve) => setTimeout(resolve, ms));
}
