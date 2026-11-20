import {
  createChiTietDieuChuyen,
  createChiTietPhieuNhap,
  createPhieuDieuChuyenTransaction,
  createPhieuNhapTransaction,
  deleteChiTietDieuChuyen,
  deleteChiTietPhieuNhap,
  getPhieuDieuChuyenPage,
  getPhieuDieuChuyenWithDetails,
  getPhieuNhapPage,
  getPhieuNhapWithDetails,
  updateChiTietDieuChuyen,
  updateChiTietPhieuNhap,
} from "@/services/documentService";
import {
  ChiTietDieuChuyenRequest,
  ChiTietDieuChuyenInfoResponse,
  ChiTietPhieuNhapRequest,
  ChiTietPhieuNhapInfoResponse,
  PhieuDieuChuyenHeaderRequest,
  PhieuDieuChuyenResponse,
  PhieuNhapHeaderRequest,
  PhieuNhapResponse,
} from "@/types/documents";
import { MasterDataResource } from "@/types/master-data";

export type DocumentFieldType = "text" | "number" | "date" | "textarea";

export interface DocumentField {
  key: string;
  label: string;
  type: DocumentFieldType;
  required?: boolean;
  maxLength?: number;
  relation?: MasterDataResource;
}

export interface DocumentRow {
  id: string;
  date: string | null;
  facts: Array<{ label: string; value: string | null }>;
}

export interface DocumentDetailRow {
  id: number;
  code: string;
  quantity: number;
  unit: string | null;
  values: Record<string, string>;
}

export interface DocumentInfoField {
  label: string;
  value: string | null;
}

export interface DocumentInfoSection {
  title: string;
  fields: DocumentInfoField[];
}

export interface DocumentDetailsResult {
  headerSections: DocumentInfoSection[];
  items: DocumentDetailRow[];
}

export interface DocumentDetailColumn {
  key: string;
  label: string;
}

export interface DocumentDefinition {
  idLabel: string;
  title: string;
  description: string;
  headerKeyField: string;
  headerFields: DocumentField[];
  detailFields: DocumentField[];
  detailColumns: DocumentDetailColumn[];
  loadPage: (page: number, size: number) => Promise<{
    items: DocumentRow[];
    total: number;
    page: number;
    size: number;
  }>;
  createTransaction: (
    header: Record<string, string>,
    details: Array<Record<string, string>>
  ) => Promise<unknown>;
  createDetail: (
    headerId: string,
    detail: Record<string, string>
  ) => Promise<unknown>;
  loadDetails: (headerId: string) => Promise<DocumentDetailsResult>;
  updateDetail: (
    headerId: string,
    detailId: number,
    detail: Record<string, string>
  ) => Promise<unknown>;
  deleteDetail: (detailId: number) => Promise<void>;
}

function text(values: Record<string, string>, key: string): string {
  return values[key]?.trim() ?? "";
}

function optionalText(
  values: Record<string, string>,
  key: string
): string | null {
  return text(values, key) || null;
}

function numberValue(values: Record<string, string>, key: string): number {
  const parsed = Number(values[key]);
  if (!Number.isFinite(parsed)) {
    throw new Error(`${key} phải là một số hợp lệ.`);
  }
  return parsed;
}

function optionalNumber(
  values: Record<string, string>,
  key: string
): number | null {
  return text(values, key) ? numberValue(values, key) : null;
}

function detailValues(row: object): Record<string, string> {
  return Object.fromEntries(
    Object.entries(row).map(([key, value]) => [
      key,
      value === null || value === undefined ? "" : String(value),
    ])
  );
}

function infoFields(
  source: object | null,
  labels: Record<string, string>
): DocumentInfoField[] {
  return Object.entries(labels).map(([key, label]) => {
    const value = source ? Reflect.get(source, key) : null;
    return {
      label,
      value: value === null || value === undefined ? null : String(value),
    };
  });
}

function mapReceiptDetail(
  row: ChiTietPhieuNhapInfoResponse
): DocumentDetailRow {
  return {
    id: row.id,
    code: row.maHang,
    quantity: row.soLuong,
    unit: row.dvt,
    values: detailValues(row),
  };
}

function mapTransferDetail(
  row: ChiTietDieuChuyenInfoResponse
): DocumentDetailRow {
  return {
    id: row.id,
    code: row.maVatTu,
    quantity: row.soLuong,
    unit: row.dvt,
    values: detailValues(row),
  };
}

function receiptDetailRequest(
  headerId: string | null,
  detail: Record<string, string>
): ChiTietPhieuNhapRequest {
  return {
    ...(headerId ? { soPhieuNhap: headerId } : {}),
    maHang: text(detail, "maHang"),
    dvt: optionalText(detail, "dvt"),
    soLuong: numberValue(detail, "soLuong"),
    tkNo: optionalText(detail, "tkNo"),
    tkCo: optionalText(detail, "tkCo"),
    maPhi: optionalText(detail, "maPhi"),
    donTrongThietKe: optionalNumber(detail, "donTrongThietKe"),
    tyLeDonTrongThucTeThietKe: optionalNumber(detail, "tyLeDonTrongThucTeThietKe"),
    caSanXuat: optionalText(detail, "caSanXuat"),
    maySanXuat: optionalText(detail, "maySanXuat"),
    maCdgtVt: optionalText(detail, "maCdgtVt"),
    maLoi: optionalText(detail, "maLoi"),
    tenLoi: optionalText(detail, "tenLoi"),
    soLenhSx: optionalText(detail, "soLenhSx"),
    donHangGc: optionalText(detail, "donHangGc"),
    giaGc: optionalNumber(detail, "giaGc"),
    tienGc: optionalNumber(detail, "tienGc"),
  };
}

function transferDetailRequest(
  headerId: string | null,
  detail: Record<string, string>
): ChiTietDieuChuyenRequest {
  return {
    ...(headerId ? { maGiaoDich: headerId } : {}),
    donHang: optionalText(detail, "donHang"),
    maVatTu: text(detail, "maVatTu"),
    dvt: optionalText(detail, "dvt"),
    tonKho: optionalNumber(detail, "tonKho"),
    soLuong: numberValue(detail, "soLuong"),
    dvt2: optionalText(detail, "dvt2"),
    soLuong2: optionalNumber(detail, "soLuong2"),
    gia: optionalNumber(detail, "gia"),
    tien: optionalNumber(detail, "tien"),
    giaDinhDanh: optionalNumber(detail, "giaDinhDanh"),
    maNxTkNo: optionalText(detail, "maNxTkNo"),
    tkVatTuTkCo: optionalText(detail, "tkVatTuTkCo"),
    phieuYeuCauNvl: optionalText(detail, "phieuYeuCauNvl"),
    ghiChu: optionalText(detail, "ghiChu"),
  };
}

function mapReceipt(row: PhieuNhapResponse): DocumentRow {
  return {
    id: row.soPhieuNhap,
    date: row.ngayNhap,
    facts: [
      { label: "Nhà cung cấp", value: row.maNcc },
      { label: "Kho nhập", value: row.maKhoHang },
      { label: "Trạng thái", value: row.trangThaiPhieu },
    ],
  };
}

function mapTransfer(row: PhieuDieuChuyenResponse): DocumentRow {
  return {
    id: row.maGiaoDich,
    date: row.ngayChungTu,
    facts: [
      { label: "Kho xuất", value: row.maKhoXuat },
      { label: "Kho nhập", value: row.maKhoNhap },
      { label: "Khách hàng", value: row.maKhachHang },
    ],
  };
}

const receiptHeaderFields: DocumentField[] = [
  { key: "soPhieuNhap", label: "Số phiếu nhập", type: "text", required: true, maxLength: 30 },
  { key: "ngayNhap", label: "Ngày nhập", type: "date", required: true },
  { key: "maChungTu", label: "Mã chứng từ", type: "text" },
  { key: "soDonHang", label: "Số đơn hàng", type: "text" },
  { key: "soHoaDon", label: "Số hóa đơn", type: "text" },
  { key: "phieuYeuCau", label: "Phiếu yêu cầu", type: "text" },
  { key: "maNcc", label: "Nhà cung cấp", type: "text", relation: "DoiTac" },
  { key: "maHopDong", label: "Mã hợp đồng", type: "text" },
  { key: "maGiaoDich", label: "Mã giao dịch điều chuyển", type: "text" },
  { key: "maKhoHang", label: "Kho nhập", type: "text", relation: "Kho" },
  { key: "maKhoXuat", label: "Kho xuất", type: "text", relation: "Kho" },
  { key: "tenPhanXuong", label: "Tên phân xưởng", type: "text" },
  { key: "maBoPhan", label: "Mã bộ phận", type: "text" },
  { key: "tenBoPhan", label: "Tên bộ phận", type: "text" },
  { key: "userTaoPo", label: "Người tạo PO", type: "text" },
  { key: "nguoiLapPhieu", label: "Người lập phiếu", type: "text" },
  { key: "maCdgtPhieu", label: "Mã công đoạn phiếu", type: "text" },
  { key: "trangThaiPhieu", label: "Trạng thái phiếu", type: "text" },
];

const receiptDetailFields: DocumentField[] = [
  { key: "maHang", label: "Mã vật tư", type: "text", required: true, maxLength: 50, relation: "DanhMucVatTu" },
  { key: "dvt", label: "Đơn vị tính", type: "text" },
  { key: "soLuong", label: "Số lượng", type: "number", required: true },
  { key: "tkNo", label: "Tài khoản nợ", type: "text" },
  { key: "tkCo", label: "Tài khoản có", type: "text" },
  { key: "maPhi", label: "Mã phí", type: "text" },
  { key: "donTrongThietKe", label: "Đơn trong thiết kế", type: "number" },
  { key: "tyLeDonTrongThucTeThietKe", label: "Tỷ lệ đơn thực tế/thiết kế", type: "number" },
  { key: "caSanXuat", label: "Ca sản xuất", type: "text" },
  { key: "maySanXuat", label: "Máy sản xuất", type: "text" },
  { key: "maCdgtVt", label: "Mã công đoạn vật tư", type: "text" },
  { key: "maLoi", label: "Mã lỗi", type: "text" },
  { key: "tenLoi", label: "Tên lỗi", type: "text" },
  { key: "soLenhSx", label: "Số lệnh sản xuất", type: "text" },
  { key: "donHangGc", label: "Đơn hàng gia công", type: "text" },
  { key: "giaGc", label: "Giá gia công", type: "number" },
  { key: "tienGc", label: "Tiền gia công", type: "number" },
];

const transferHeaderFields: DocumentField[] = [
  { key: "maGiaoDich", label: "Mã giao dịch", type: "text", required: true, maxLength: 30 },
  { key: "ngayChungTu", label: "Ngày chứng từ", type: "date" },
  { key: "maKhachHang", label: "Khách hàng", type: "text", relation: "KhachHang" },
  { key: "nguoiThucHien", label: "Người thực hiện", type: "text", maxLength: 100 },
  { key: "maKhoXuat", label: "Kho xuất", type: "text", required: true, maxLength: 20, relation: "Kho" },
  { key: "maKhoNhap", label: "Kho nhập", type: "text", required: true, maxLength: 20, relation: "Kho" },
  { key: "dienGiai", label: "Diễn giải", type: "textarea", maxLength: 500 },
];

const transferDetailFields: DocumentField[] = [
  { key: "donHang", label: "Đơn hàng", type: "text" },
  { key: "maVatTu", label: "Mã vật tư", type: "text", required: true, maxLength: 50, relation: "DanhMucVatTu" },
  { key: "dvt", label: "Đơn vị tính", type: "text" },
  { key: "tonKho", label: "Tồn kho", type: "number" },
  { key: "soLuong", label: "Số lượng", type: "number", required: true },
  { key: "dvt2", label: "Đơn vị tính 2", type: "text" },
  { key: "soLuong2", label: "Số lượng 2", type: "number" },
  { key: "gia", label: "Giá", type: "number" },
  { key: "tien", label: "Tiền", type: "number" },
  { key: "giaDinhDanh", label: "Giá định danh", type: "number" },
  { key: "maNxTkNo", label: "Mã NX tài khoản nợ", type: "text" },
  { key: "tkVatTuTkCo", label: "Tài khoản vật tư có", type: "text" },
  { key: "phieuYeuCauNvl", label: "Phiếu yêu cầu NVL", type: "text" },
  { key: "ghiChu", label: "Ghi chú", type: "textarea" },
];

export const RECEIPT_DOCUMENT: DocumentDefinition = {
  idLabel: "Số phiếu nhập",
  title: "Phiếu nhập",
  description: "Quản lý phiếu nhập kho và các dòng vật tư.",
  headerKeyField: "soPhieuNhap",
  headerFields: receiptHeaderFields,
  detailFields: receiptDetailFields,
  detailColumns: [
    { key: "id", label: "ID" },
    { key: "soPhieuNhap", label: "Số phiếu nhập" },
    { key: "maHang", label: "Mã vật tư" },
    { key: "tenHang", label: "Tên vật tư" },
    { key: "dvt", label: "ĐVT" },
    { key: "soLuong", label: "Số lượng" },
    { key: "tkNo", label: "TK nợ" },
    { key: "tkCo", label: "TK có" },
    { key: "maPhi", label: "Mã phí" },
    { key: "donTrongThietKe", label: "Đơn trong thiết kế" },
    {
      key: "tyLeDonTrongThucTeThietKe",
      label: "Tỷ lệ thực tế/thiết kế",
    },
    { key: "caSanXuat", label: "Ca sản xuất" },
    { key: "maySanXuat", label: "Máy sản xuất" },
    { key: "maCdgtVt", label: "Mã công đoạn VT" },
    { key: "maLoi", label: "Mã lỗi" },
    { key: "tenLoi", label: "Tên lỗi" },
    { key: "soLenhSx", label: "Số lệnh SX" },
    { key: "donHangGc", label: "Đơn hàng gia công" },
    { key: "giaGc", label: "Giá gia công" },
    { key: "tienGc", label: "Tiền gia công" },
  ],
  async loadPage(page, size) {
    const result = await getPhieuNhapPage(page, size);
    return { ...result, items: result.items.map(mapReceipt) };
  },
  createTransaction(header, details) {
    const phieuNhap: PhieuNhapHeaderRequest = {
      soPhieuNhap: text(header, "soPhieuNhap"),
      ngayNhap: text(header, "ngayNhap"),
      maChungTu: optionalText(header, "maChungTu"),
      soDonHang: optionalText(header, "soDonHang"),
      soHoaDon: optionalText(header, "soHoaDon"),
      phieuYeuCau: optionalText(header, "phieuYeuCau"),
      maNcc: optionalText(header, "maNcc"),
      maHopDong: optionalText(header, "maHopDong"),
      maGiaoDich: optionalText(header, "maGiaoDich"),
      maKhoHang: optionalText(header, "maKhoHang"),
      maKhoXuat: optionalText(header, "maKhoXuat"),
      tenPhanXuong: optionalText(header, "tenPhanXuong"),
      maBoPhan: optionalText(header, "maBoPhan"),
      tenBoPhan: optionalText(header, "tenBoPhan"),
      userTaoPo: optionalText(header, "userTaoPo"),
      nguoiLapPhieu: optionalText(header, "nguoiLapPhieu"),
      maCdgtPhieu: optionalText(header, "maCdgtPhieu"),
      trangThaiPhieu: optionalText(header, "trangThaiPhieu"),
    };
    const chiTietPhieuNhaps = details.map((detail) =>
      receiptDetailRequest(null, detail)
    );
    return createPhieuNhapTransaction({ phieuNhap, chiTietPhieuNhaps });
  },
  createDetail(headerId, detail) {
    return createChiTietPhieuNhap(receiptDetailRequest(headerId, detail));
  },
  async loadDetails(headerId) {
    const result = await getPhieuNhapWithDetails(headerId);
    return {
      headerSections: [
        {
          title: "Thông tin phiếu",
          fields: infoFields(result, {
            soPhieuNhap: "Số phiếu nhập",
            ngayNhap: "Ngày nhập",
            maChungTu: "Mã chứng từ",
            soDonHang: "Số đơn hàng",
            soHoaDon: "Số hóa đơn",
            phieuYeuCau: "Phiếu yêu cầu",
            maNcc: "Mã nhà cung cấp",
            maHopDong: "Mã hợp đồng",
            maGiaoDich: "Mã giao dịch",
            maKhoHang: "Mã kho nhập",
            maKhoXuat: "Mã kho xuất",
            tenPhanXuong: "Tên phân xưởng",
            maBoPhan: "Mã bộ phận",
            tenBoPhan: "Tên bộ phận",
            userTaoPo: "Người tạo PO",
            nguoiLapPhieu: "Người lập phiếu",
            maCdgtPhieu: "Mã công đoạn phiếu",
            trangThaiPhieu: "Trạng thái phiếu",
          }),
        },
        {
          title: "Nhà cung cấp",
          fields: infoFields(result.nhaCungCap, {
            maDoiTac: "Mã đối tác",
            tenDoiTac: "Tên đối tác",
            loaiDoiTac: "Loại đối tác",
            diaChi: "Địa chỉ",
            soDienThoai: "Số điện thoại",
            maSoThue: "Mã số thuế",
            nguoiLienHe: "Người liên hệ",
          }),
        },
        {
          title: "Kho nhập",
          fields: infoFields(result.khoHang, {
            maKho: "Mã kho",
            tenKho: "Tên kho",
            loaiKho: "Loại kho",
            diaChi: "Địa chỉ",
            maDoiTacPhuTrach: "Mã đối tác phụ trách",
            ghiChu: "Ghi chú",
          }),
        },
        {
          title: "Kho xuất",
          fields: infoFields(result.khoXuat, {
            maKho: "Mã kho",
            tenKho: "Tên kho",
            loaiKho: "Loại kho",
            diaChi: "Địa chỉ",
            maDoiTacPhuTrach: "Mã đối tác phụ trách",
            ghiChu: "Ghi chú",
          }),
        },
      ],
      items: result.chiTietPhieuNhaps.map(mapReceiptDetail),
    };
  },
  updateDetail(headerId, detailId, detail) {
    return updateChiTietPhieuNhap(
      detailId,
      receiptDetailRequest(headerId, detail)
    );
  },
  deleteDetail(detailId) {
    return deleteChiTietPhieuNhap(detailId);
  },
};

export const TRANSFER_DOCUMENT: DocumentDefinition = {
  idLabel: "Mã giao dịch",
  title: "Phiếu điều chuyển",
  description: "Quản lý điều chuyển vật tư giữa các kho.",
  headerKeyField: "maGiaoDich",
  headerFields: transferHeaderFields,
  detailFields: transferDetailFields,
  detailColumns: [
    { key: "id", label: "ID" },
    { key: "maGiaoDich", label: "Mã giao dịch" },
    { key: "maVatTu", label: "Mã vật tư" },
    { key: "tenVatTu", label: "Tên vật tư" },
    { key: "donHang", label: "Đơn hàng" },
    { key: "dvt", label: "ĐVT" },
    { key: "tonKho", label: "Tồn kho" },
    { key: "soLuong", label: "Số lượng" },
    { key: "dvt2", label: "ĐVT 2" },
    { key: "soLuong2", label: "Số lượng 2" },
    { key: "gia", label: "Giá" },
    { key: "tien", label: "Tiền" },
    { key: "giaDinhDanh", label: "Giá định danh" },
    { key: "maNxTkNo", label: "Mã NX TK nợ" },
    { key: "tkVatTuTkCo", label: "TK vật tư có" },
    { key: "phieuYeuCauNvl", label: "Phiếu yêu cầu NVL" },
    { key: "ghiChu", label: "Ghi chú" },
  ],
  async loadPage(page, size) {
    const result = await getPhieuDieuChuyenPage(page, size);
    return { ...result, items: result.items.map(mapTransfer) };
  },
  createTransaction(header, details) {
    const phieuDieuChuyen: PhieuDieuChuyenHeaderRequest = {
      maGiaoDich: text(header, "maGiaoDich"),
      ngayChungTu: optionalText(header, "ngayChungTu"),
      maKhachHang: optionalText(header, "maKhachHang"),
      nguoiThucHien: optionalText(header, "nguoiThucHien"),
      maKhoXuat: text(header, "maKhoXuat"),
      maKhoNhap: text(header, "maKhoNhap"),
      dienGiai: optionalText(header, "dienGiai"),
    };
    if (phieuDieuChuyen.maKhoXuat === phieuDieuChuyen.maKhoNhap) {
      throw new Error("Kho xuất phải khác kho nhập.");
    }
    const chiTietDieuChuyens = details.map((detail) =>
      transferDetailRequest(null, detail)
    );
    return createPhieuDieuChuyenTransaction({
      phieuDieuChuyen,
      chiTietDieuChuyens,
    });
  },
  createDetail(headerId, detail) {
    return createChiTietDieuChuyen(transferDetailRequest(headerId, detail));
  },
  async loadDetails(headerId) {
    const result = await getPhieuDieuChuyenWithDetails(headerId);
    return {
      headerSections: [
        {
          title: "Thông tin phiếu",
          fields: infoFields(result, {
            maGiaoDich: "Mã giao dịch",
            ngayChungTu: "Ngày chứng từ",
            maKhachHang: "Mã khách hàng",
            nguoiThucHien: "Người thực hiện",
            maKhoXuat: "Mã kho xuất",
            maKhoNhap: "Mã kho nhập",
            dienGiai: "Diễn giải",
          }),
        },
        {
          title: "Khách hàng",
          fields: infoFields(result.khachHang, {
            maKhachHang: "Mã khách hàng",
            tenKhachHang: "Tên khách hàng",
            diaChi: "Địa chỉ",
            soDienThoai: "Số điện thoại",
            email: "Email",
            maSoThue: "Mã số thuế",
            nguoiLienHe: "Người liên hệ",
            ghiChu: "Ghi chú",
          }),
        },
        {
          title: "Kho xuất",
          fields: infoFields(result.khoXuat, {
            maKho: "Mã kho",
            tenKho: "Tên kho",
            loaiKho: "Loại kho",
            diaChi: "Địa chỉ",
            maDoiTacPhuTrach: "Mã đối tác phụ trách",
            ghiChu: "Ghi chú",
          }),
        },
        {
          title: "Kho nhập",
          fields: infoFields(result.khoNhap, {
            maKho: "Mã kho",
            tenKho: "Tên kho",
            loaiKho: "Loại kho",
            diaChi: "Địa chỉ",
            maDoiTacPhuTrach: "Mã đối tác phụ trách",
            ghiChu: "Ghi chú",
          }),
        },
      ],
      items: result.chiTietDieuChuyens.map(mapTransferDetail),
    };
  },
  updateDetail(headerId, detailId, detail) {
    return updateChiTietDieuChuyen(
      detailId,
      transferDetailRequest(headerId, detail)
    );
  },
  deleteDetail(detailId) {
    return deleteChiTietDieuChuyen(detailId);
  },
};

