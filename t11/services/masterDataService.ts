import { API_CONFIG } from "@/services/apiConfig";
import { MASTER_DATA_DEFINITIONS } from "@/lib/master-data-definitions";
import {
  MasterDataRequestMap,
  MasterDataResource,
  MasterDataResponseMap,
  PagedResult,
} from "@/types/master-data";

const configuredApiRoot = API_CONFIG.baseUrl.replace(/\/+$/, "");
const API_ROOT =
  /^https?:\/\//i.test(configuredApiRoot) &&
  !/\/api$/i.test(configuredApiRoot)
    ? `${configuredApiRoot}/api`
    : configuredApiRoot;

export class MasterDataApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly fieldErrors: Record<string, string> = {}
  ) {
    super(message);
    this.name = "MasterDataApiError";
  }
}

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  if (response.status === 204) return undefined as T;

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
            errors?: Record<string, string[]>;
          })
        : undefined;
    const fieldErrors = Object.fromEntries(
      Object.entries(problem?.errors ?? {}).map(([key, messages]) => [
        key,
        messages.join(" "),
      ])
    );
    throw new MasterDataApiError(
      problem?.detail || problem?.title || "Không thể hoàn tất yêu cầu.",
      response.status,
      fieldErrors
    );
  }

  return body as T;
}

export async function getMasterDataPage<R extends MasterDataResource>(
  resource: R,
  page = 1,
  size = 20
): Promise<PagedResult<MasterDataResponseMap[R]>> {
  const query = new URLSearchParams({ page: String(page), size: String(size) });
  return requestJson(
    `${API_ROOT}${MASTER_DATA_DEFINITIONS[resource].route}?${query}`
  );
}

export async function getMasterDataById<R extends MasterDataResource>(
  resource: R,
  id: string
): Promise<MasterDataResponseMap[R]> {
  return requestJson(
    `${API_ROOT}${MASTER_DATA_DEFINITIONS[resource].route}/${encodeURIComponent(id)}`
  );
}

export async function createMasterData<R extends MasterDataResource>(
  resource: R,
  request: MasterDataRequestMap[R]
): Promise<MasterDataResponseMap[R]> {
  return requestJson(
    `${API_ROOT}${MASTER_DATA_DEFINITIONS[resource].route}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    }
  );
}

export async function updateMasterData<R extends MasterDataResource>(
  resource: R,
  id: string,
  request: MasterDataRequestMap[R]
): Promise<MasterDataResponseMap[R]> {
  return requestJson(
    `${API_ROOT}${MASTER_DATA_DEFINITIONS[resource].route}/${encodeURIComponent(id)}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    }
  );
}

export async function deleteMasterData<R extends MasterDataResource>(
  resource: R,
  id: string
): Promise<void> {
  await requestJson<void>(
    `${API_ROOT}${MASTER_DATA_DEFINITIONS[resource].route}/${encodeURIComponent(id)}`,
    { method: "DELETE" }
  );
}

export async function getMasterDataOptions<R extends MasterDataResource>(
  resource: R
): Promise<MasterDataResponseMap[R][]> {
  const firstPage = await getMasterDataPage(resource, 1);
  const items = [...firstPage.items];
  const totalPages = Math.ceil(firstPage.total / firstPage.size);
  for (let page = 2; page <= totalPages; page += 1) {
    const result = await getMasterDataPage(resource, page);
    items.push(...result.items);
  }
  return items;
}
