export interface PagedResult<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
}

export interface BanThanhPhamRequest {
  maBanThanhPham: string;
  tenBanThanhPham: string;
  maSanPham: string | null;
  maNguyenLieuGoc: string | null;
  chieuDaiBanThanhPham: number | null;
  heSoQuyDoi: number | null;
  congDoanGiaCong: string | null;
  loaiGiaCong: string | null;
  xuLyBeMat: string | null;
  maDonViGiaCong: string | null;
  donGiaGiaCong: number | null;
  trangThai: string;
  ghiChu: string | null;
}

export interface BanThanhPhamResponse extends BanThanhPhamRequest {
  maSanPhamNavigationTenSanPham: string | null;
  maNguyenLieuGocNavigationTenNguyenLieu: string | null;
  maDonViGiaCongNavigationTenDoiTac: string | null;
}

export interface DanhMucVatTuRequest {
  maVatTu: string;
  tenVatTu: string;
  loaiVatTu: string;
  maSanPham: string | null;
  chieuDaiSanPham: number | null;
  maNguyenLieu: string | null;
  maBanThanhPham: string | null;
  heSoQuyDoiTuThanhDai: number | null;
  nhomVatTu1: string | null;
  nhomVatTu2: string | null;
  donViTinh: string;
  trangThai: string;
  ghiChu: string | null;
}

export interface DanhMucVatTuResponse extends DanhMucVatTuRequest {
  maSanPhamNavigationTenSanPham: string | null;
  maNguyenLieuNavigationTenNguyenLieu: string | null;
  maBanThanhPhamNavigationTenBanThanhPham: string | null;
}

export interface DoiTacRequest {
  maDoiTac: string;
  tenDoiTac: string;
  loaiDoiTac: string;
  diaChi: string | null;
  soDienThoai: string | null;
  maSoThue: string | null;
  nguoiLienHe: string | null;
}

export type DoiTacResponse = DoiTacRequest;

export interface KhachHangRequest {
  maKhachHang: string;
  tenKhachHang: string;
  diaChi: string | null;
  soDienThoai: string | null;
  email: string | null;
  maSoThue: string | null;
  nguoiLienHe: string | null;
  ghiChu: string | null;
}

export type KhachHangResponse = KhachHangRequest;

export interface KhoRequest {
  maKho: string;
  tenKho: string;
  loaiKho: string;
  diaChi: string | null;
  maDoiTacPhuTrach: string | null;
  ghiChu: string | null;
}

export interface KhoResponse extends KhoRequest {
  maDoiTacPhuTrachNavigationTenDoiTac: string | null;
}

export interface NguyenLieuRequest {
  maNguyenLieu: string;
  tenNguyenLieu: string;
  loaiNguyenLieu: string;
  maSanPham: string | null;
  chieuDaiThanh: number | null;
  maNhaCungCap: string | null;
  ghiChu: string | null;
}

export interface NguyenLieuResponse extends NguyenLieuRequest {
  maSanPhamNavigationTenSanPham: string | null;
  maNhaCungCapNavigationTenDoiTac: string | null;
}

export interface SanPhamRequest {
  maSanPham: string;
  tenSanPham: string;
  chieuDaiSanPham: number | null;
  maKhachHang: string | null;
  moTa: string | null;
  trangThai: string;
}

export interface SanPhamResponse extends SanPhamRequest {
  maKhachHangNavigationTenKhachHang: string | null;
}

export interface MasterDataRequestMap {
  BanThanhPham: BanThanhPhamRequest;
  DanhMucVatTu: DanhMucVatTuRequest;
  DoiTac: DoiTacRequest;
  KhachHang: KhachHangRequest;
  Kho: KhoRequest;
  NguyenLieu: NguyenLieuRequest;
  SanPham: SanPhamRequest;
}

export interface MasterDataResponseMap {
  BanThanhPham: BanThanhPhamResponse;
  DanhMucVatTu: DanhMucVatTuResponse;
  DoiTac: DoiTacResponse;
  KhachHang: KhachHangResponse;
  Kho: KhoResponse;
  NguyenLieu: NguyenLieuResponse;
  SanPham: SanPhamResponse;
}

export type MasterDataResource = keyof MasterDataRequestMap;

export type MasterDataField = {
  key: string;
  label: string;
  type: "text" | "number" | "textarea" | "select";
  required?: boolean;
  maxLength?: number;
  relation?: MasterDataResource;
  navigationField?: string;
  options?: Array<{ label: string; value: string }>;
};

export interface MasterDataDefinition {
  label: string;
  route: string;
  idField: string;
  nameField: string;
  fields: MasterDataField[];
}
