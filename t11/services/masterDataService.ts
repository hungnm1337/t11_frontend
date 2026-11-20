import { MASTER_DATA_DEFINITIONS } from "@/lib/master-data-definitions";
import { API_ROOT, ApiError as MasterDataApiError, requestJson } from "@/services/apiClient";
import {
  MasterDataRequestMap,
  MasterDataResource,
  MasterDataResponseMap,
  PagedResult,
} from "@/types/master-data";

export { MasterDataApiError };

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
