import { API_ROOT, requestJson } from "@/services/apiClient";
import {
  ChiTietDieuChuyenRequest,
  ChiTietDieuChuyenPage,
  ChiTietDieuChuyenResponse,
  ChiTietPhieuNhapRequest,
  ChiTietPhieuNhapPage,
  ChiTietPhieuNhapResponse,
  PhieuDieuChuyenPage,
  PhieuDieuChuyenResponse,
  PhieuDieuChuyenInfoResponse,
  PhieuDieuChuyenTransactionRequest,
  PhieuDieuChuyenTransactionResponse,
  PhieuNhapPage,
  PhieuNhapResponse,
  PhieuNhapInfoResponse,
  PhieuNhapTransactionRequest,
  PhieuNhapTransactionResponse,
} from "@/types/documents";

function pageQuery(page: number, size: number): string {
  return new URLSearchParams({
    page: String(page),
    size: String(size),
  }).toString();
}

export function getPhieuNhapPage(
  page = 1,
  size = 20
): Promise<PhieuNhapPage> {
  return requestJson(
    `${API_ROOT}/PhieuNhapCrud?${pageQuery(page, size)}`
  );
}

export function getPhieuDieuChuyenPage(
  page = 1,
  size = 20
): Promise<PhieuDieuChuyenPage> {
  return requestJson(
    `${API_ROOT}/PhieuDieuChuyenCrud?${pageQuery(page, size)}`
  );
}

export function getPhieuNhapWithDetails(
  soPhieuNhap: string
): Promise<PhieuNhapInfoResponse> {
  return requestJson(
    `${API_ROOT}/PhieuNhap/${encodeURIComponent(soPhieuNhap)}`
  );
}

export function getPhieuDieuChuyenWithDetails(
  maGiaoDich: string
): Promise<PhieuDieuChuyenInfoResponse> {
  return requestJson(
    `${API_ROOT}/PhieuDieuChuyen/${encodeURIComponent(maGiaoDich)}`
  );
}

export function createPhieuNhapTransaction(
  request: PhieuNhapTransactionRequest
): Promise<PhieuNhapTransactionResponse> {
  return requestJson(`${API_ROOT}/PhieuNhap`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
}

export function createPhieuDieuChuyenTransaction(
  request: PhieuDieuChuyenTransactionRequest
): Promise<PhieuDieuChuyenTransactionResponse> {
  return requestJson(`${API_ROOT}/PhieuDieuChuyen`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
}

export function createChiTietPhieuNhap(
  request: ChiTietPhieuNhapRequest
): Promise<ChiTietPhieuNhapResponse> {
  return requestJson(`${API_ROOT}/ChiTietPhieuNhap`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
}

export function createChiTietDieuChuyen(
  request: ChiTietDieuChuyenRequest
): Promise<ChiTietDieuChuyenResponse> {
  return requestJson(`${API_ROOT}/ChiTietDieuChuyen`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
}

export function getChiTietPhieuNhapPage(
  page = 1,
  size = 200
): Promise<ChiTietPhieuNhapPage> {
  return requestJson(
    `${API_ROOT}/ChiTietPhieuNhap?${pageQuery(page, size)}`
  );
}

export function getChiTietDieuChuyenPage(
  page = 1,
  size = 200
): Promise<ChiTietDieuChuyenPage> {
  return requestJson(
    `${API_ROOT}/ChiTietDieuChuyen?${pageQuery(page, size)}`
  );
}

export function updateChiTietPhieuNhap(
  id: number,
  request: ChiTietPhieuNhapRequest
): Promise<ChiTietPhieuNhapResponse> {
  return requestJson(`${API_ROOT}/ChiTietPhieuNhap/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
}

export function updateChiTietDieuChuyen(
  id: number,
  request: ChiTietDieuChuyenRequest
): Promise<ChiTietDieuChuyenResponse> {
  return requestJson(`${API_ROOT}/ChiTietDieuChuyen/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
}

export function deleteChiTietPhieuNhap(id: number): Promise<void> {
  return requestJson(`${API_ROOT}/ChiTietPhieuNhap/${id}`, {
    method: "DELETE",
  });
}

export function deleteChiTietDieuChuyen(id: number): Promise<void> {
  return requestJson(`${API_ROOT}/ChiTietDieuChuyen/${id}`, {
    method: "DELETE",
  });
}
