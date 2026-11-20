import { showApiToast } from "@/components/ui/toast";
import { API_CONFIG } from "@/services/apiConfig";

const configuredApiRoot = API_CONFIG.baseUrl.replace(/\/+$/, "");
export const API_ROOT =
  /^https?:\/\//i.test(configuredApiRoot) &&
  !/\/api$/i.test(configuredApiRoot)
    ? `${configuredApiRoot}/api`
    : configuredApiRoot;

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly fieldErrors: Record<string, string> = {}
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function requestJson<T>(
  url: string,
  init?: RequestInit
): Promise<T> {
  const method = init?.method ?? "GET";

  try {
    const response = await fetch(url, init);
    if (response.status === 204) {
      if (method !== "GET") {
        showApiToast("success", "API thành công", `${method} — thao tác hoàn tất.`);
      }
      return undefined as T;
    }

    const contentType = response.headers.get("content-type") || "";
    const body: unknown = contentType.includes("json")
      ? await response.json()
      : await response.text();

    if (!response.ok) {
      const problem =
        typeof body === "object" && body !== null
          ? (body as {
              detail?: string;
              title?: string;
              errors?: Record<string, string[] | string>;
            })
          : undefined;
      const message =
        problem?.detail || problem?.title || "Không thể hoàn tất yêu cầu.";
      const fieldErrors = Object.fromEntries(
        Object.entries(problem?.errors ?? {}).map(([key, messages]) => [
          key,
          Array.isArray(messages) ? messages.join(" ") : messages,
        ])
      );
      showApiToast("error", `API thất bại (${response.status})`, message);
      throw new ApiError(message, response.status, fieldErrors);
    }

    if (method !== "GET") {
      showApiToast(
        "success",
        "API thành công",
        `${method} — yêu cầu hoàn tất (${response.status}).`
      );
    }
    return body as T;
  } catch (caught) {
    if (caught instanceof ApiError) throw caught;
    const message =
      caught instanceof Error
        ? caught.message
        : "Không thể kết nối đến máy chủ.";
    showApiToast("error", "Không thể gọi API", message);
    throw caught;
  }
}
