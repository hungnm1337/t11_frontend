import { PagedResult } from "@/types/master-data";

export interface PhieuNhapHeaderRequest {
  soPhieuNhap: string;
  ngayNhap: string;
  maChungTu: string | null;
  soDonHang: string | null;
  soHoaDon: string | null;
  phieuYeuCau: string | null;
  maNcc: string | null;
  maHopDong: string | null;
  maGiaoDich: string | null;
  maKhoHang: string | null;
  maKhoXuat: string | null;
  tenPhanXuong: string | null;
  maBoPhan: string | null;
  tenBoPhan: string | null;
  userTaoPo: string | null;
  nguoiLapPhieu: string | null;
  maCdgtPhieu: string | null;
  trangThaiPhieu: string | null;
}

export interface ChiTietPhieuNhapRequest {
  soPhieuNhap?: string;
  maHang: string;
  dvt: string | null;
  soLuong: number;
  tkNo: string | null;
  tkCo: string | null;
  maPhi: string | null;
  donTrongThietKe: number | null;
  tyLeDonTrongThucTeThietKe: number | null;
  caSanXuat: string | null;
  maySanXuat: string | null;
  maCdgtVt: string | null;
  maLoi: string | null;
  tenLoi: string | null;
  soLenhSx: string | null;
  donHangGc: string | null;
  giaGc: number | null;
  tienGc: number | null;
}

export interface PhieuDieuChuyenHeaderRequest {
  maGiaoDich: string;
  ngayChungTu: string | null;
  maKhachHang: string | null;
  nguoiThucHien: string | null;
  maKhoXuat: string;
  maKhoNhap: string;
  dienGiai: string | null;
}

export interface ChiTietDieuChuyenRequest {
  maGiaoDich?: string;
  donHang: string | null;
  maVatTu: string;
  dvt: string | null;
  tonKho: number | null;
  soLuong: number;
  dvt2: string | null;
  soLuong2: number | null;
  gia: number | null;
  tien: number | null;
  giaDinhDanh: number | null;
  maNxTkNo: string | null;
  tkVatTuTkCo: string | null;
  phieuYeuCauNvl: string | null;
  ghiChu: string | null;
}

export interface PhieuNhapResponse extends PhieuNhapHeaderRequest {}

export interface PhieuDieuChuyenResponse extends PhieuDieuChuyenHeaderRequest {}

export interface ChiTietPhieuNhapResponse extends ChiTietPhieuNhapRequest {
  id: number;
}

export interface ChiTietDieuChuyenResponse extends ChiTietDieuChuyenRequest {
  id: number;
}

export interface DoiTacInfoResponse {
  maDoiTac: string;
  tenDoiTac: string;
  loaiDoiTac: string;
  diaChi: string | null;
  soDienThoai: string | null;
  maSoThue: string | null;
  nguoiLienHe: string | null;
}

export interface KhachHangInfoResponse {
  maKhachHang: string;
  tenKhachHang: string;
  diaChi: string | null;
  soDienThoai: string | null;
  email: string | null;
  maSoThue: string | null;
  nguoiLienHe: string | null;
  ghiChu: string | null;
}

export interface KhoInfoResponse {
  maKho: string;
  tenKho: string;
  loaiKho: string;
  diaChi: string | null;
  maDoiTacPhuTrach: string | null;
  ghiChu: string | null;
}

export interface ChiTietPhieuNhapInfoResponse
  extends ChiTietPhieuNhapRequest {
  id: number;
  soPhieuNhap: string;
  tenHang: string | null;
}

export interface ChiTietDieuChuyenInfoResponse
  extends ChiTietDieuChuyenRequest {
  id: number;
  maGiaoDich: string;
  tenVatTu: string | null;
}

export interface PhieuNhapInfoResponse extends PhieuNhapHeaderRequest {
  nhaCungCap: DoiTacInfoResponse | null;
  khoHang: KhoInfoResponse | null;
  khoXuat: KhoInfoResponse | null;
  chiTietPhieuNhaps: ChiTietPhieuNhapInfoResponse[];
}

export interface PhieuDieuChuyenInfoResponse
  extends PhieuDieuChuyenHeaderRequest {
  khachHang: KhachHangInfoResponse | null;
  khoXuat: KhoInfoResponse;
  khoNhap: KhoInfoResponse;
  chiTietDieuChuyens: ChiTietDieuChuyenInfoResponse[];
}

export interface PhieuNhapTransactionRequest {
  phieuNhap: PhieuNhapHeaderRequest;
  chiTietPhieuNhaps: Omit<ChiTietPhieuNhapRequest, "soPhieuNhap">[];
}

export interface PhieuDieuChuyenTransactionRequest {
  phieuDieuChuyen: PhieuDieuChuyenHeaderRequest;
  chiTietDieuChuyens: Omit<ChiTietDieuChuyenRequest, "maGiaoDich">[];
}

export interface PhieuNhapTransactionResponse {
  soPhieuNhap: string;
  chiTietIds: number[];
}

export interface PhieuDieuChuyenTransactionResponse {
  maGiaoDich: string;
  chiTietIds: number[];
}

export type PhieuNhapPage = PagedResult<PhieuNhapResponse>;
export type PhieuDieuChuyenPage = PagedResult<PhieuDieuChuyenResponse>;
export type ChiTietPhieuNhapPage = PagedResult<ChiTietPhieuNhapResponse>;
export type ChiTietDieuChuyenPage = PagedResult<ChiTietDieuChuyenResponse>;
