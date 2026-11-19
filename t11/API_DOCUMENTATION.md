# Tài liệu API cho Frontend

> Tài liệu được đối chiếu từ source hiện tại của solution. Khi contract thay đổi, cập nhật tài liệu cùng pull request thay đổi API.

## 1. Thông tin chung

- **Base URL:** `https://<host>` (thay bằng URL thực tế theo môi trường).
- **Content-Type:** `application/json; charset=utf-8`.
- **JSON naming:** ASP.NET Core dùng camelCase mặc định. Ví dụ `MaKho` được gửi/nhận là `maKho`.
- **Swagger (Development):** `https://<host>/` vì Swagger UI được cấu hình với `RoutePrefix = ""`.
- **Health check:** `GET /ping` mở kết nối database và trả về chuỗi trạng thái.
- Hiện tại chưa cấu hình authentication/authorization trong API; frontend không cần gửi token theo source hiện tại.

### Kiểu dữ liệu

| C# | JSON | Ghi chú |
|---|---|---|
| `string` | `string` | Chuỗi Unicode |
| `decimal` / `decimal?` | `number` | Dùng cho số lượng, chiều dài, giá; nullable nếu có `?` |
| `int` | `number` | ID chi tiết |
| `DateOnly` / `DateOnly?` | `string` | Định dạng ngày ISO, ví dụ `2026-01-31` |
| `IReadOnlyList<T>` | `T[]` | Mảng JSON |

## 2. Quy ước response và lỗi

### Response phân trang

Các endpoint `GET` collection trả về:

```json
{
  "items": [],
  "total": 0,
  "page": 1,
  "size": 20
}
```

- `page`: mặc định `1`, nhỏ nhất `1`.
- `size`: mặc định `20`, cho phép từ `1` đến `200`.
- `items`: danh sách response model.
- `total`: tổng số bản ghi trước phân trang.
- Dữ liệu được sắp xếp theo khóa chính tăng dần.

### HTTP status

| Status | Khi nào xảy ra |
|---|---|
| `200 OK` | Lấy dữ liệu hoặc cập nhật thành công |
| `201 Created` | Tạo mới thành công; response là resource vừa tạo |
| `204 No Content` | Xóa thành công |
| `400 Bad Request` | Request sai validation, tham số phân trang sai, hoặc lỗi constraint dữ liệu |
| `404 Not Found` | Không tìm thấy resource theo `id` |
| `409 Conflict` | Mã đã tồn tại hoặc vi phạm foreign key/đang bị resource khác sử dụng |
| `500 Internal Server Error` | Lỗi máy chủ/database chưa được phân loại |

Lỗi runtime được trả dưới dạng `application/problem+json`:

```json
{
  "type": "...",
  "title": "Dữ liệu bị trùng.",
  "status": 409,
  "detail": "Mã đã tồn tại.",
  "instance": "/api/kho"
}
```

Lỗi validation do `[ApiController]` có thể trả về `400` theo format `ValidationProblemDetails` của ASP.NET Core.

## 3. Endpoint đang public

Tất cả controller dưới đây kế thừa `CrudController<TEntity, string, TRequest, TResponse>`, nên có cùng bộ endpoint:

| Resource | Route | Request body | Response |
|---|---|---|---|
| Bán thành phẩm | `/api/BanThanhPham` | `BanThanhPhamRequest` | `BanThanhPhamResponse` |
| Danh mục vật tư | `/api/DanhMucVatTu` | `DanhMucVatTuRequest` | `DanhMucVatTuResponse` |
| Đối tác | `/api/DoiTac` | `DoiTacRequest` | `DoiTacResponse` |
| Khách hàng | `/api/KhachHang` | `KhachHangRequest` | `KhachHangResponse` |
| Kho | `/api/Kho` | `KhoRequest` | `KhoResponse` |
| Nguyên liệu | `/api/NguyenLieu` | `NguyenLieuRequest` | `NguyenLieuResponse` |
| Sản phẩm | `/api/SanPham` | `SanPhamRequest` | `SanPhamResponse` |

> Route dùng đúng tên controller, bao gồm chữ hoa như bảng trên. Nên dùng đúng casing này ở frontend để tránh phụ thuộc vào cấu hình routing.

### Bộ thao tác CRUD dùng chung

Thay `<resource>` bằng route trong bảng trên và `<id>` bằng khóa chính dạng chuỗi.

#### Lấy danh sách

```http
GET /api/<resource>?page=1&size=20
```

Response `200`: `PagedResult<TResponse>`.

#### Lấy một bản ghi

```http
GET /api/<resource>/<id>
```

Response `200`: `TResponse`.

#### Tạo mới

```http
POST /api/<resource>
Content-Type: application/json
```

Body là request model tương ứng. Response `201` trả resource vừa tạo và header `Location` trỏ tới endpoint `GET /{id}`.

#### Cập nhật

```http
PUT /api/<resource>/<id>
Content-Type: application/json
```

Body là request model tương ứng. Khóa trong URL là khóa được dùng để tìm bản ghi; khóa trong body nếu có sẽ bị bỏ qua khi map update.

#### Xóa

```http
DELETE /api/<resource>/<id>
```

Response `204` không có body.

## 4. Request/response models

Các trường có dấu `?` là nullable/không bắt buộc. Giới hạn trong ngoặc vuông là giới hạn độ dài validation của request.

### 4.1 `BanThanhPham`

**Request `BanThanhPhamRequest`**

| JSON field | Type | Required / max | Ý nghĩa |
|---|---|---|---|
| `maBanThanhPham` | string | bắt buộc, 50 | Khóa chính |
| `tenBanThanhPham` | string | bắt buộc, 300 | Tên |
| `maSanPham` | string? | 30 | Mã sản phẩm |
| `maNguyenLieuGoc` | string? | 50 | Mã nguyên liệu gốc |
| `chieuDaiBanThanhPham` | number? | - | Chiều dài |
| `heSoQuyDoi` | number? | - | Hệ số quy đổi |
| `congDoanGiaCong` | string? | 200 | Công đoạn gia công |
| `loaiGiaCong` | string? | 50 | Loại gia công |
| `xuLyBeMat` | string? | 100 | Xử lý bề mặt |
| `maDonViGiaCong` | string? | 20 | Mã đơn vị gia công/đối tác |
| `donGiaGiaCong` | number? | - | Đơn giá gia công |
| `trangThai` | string | bắt buộc, 20 | Trạng thái |
| `ghiChu` | string? | 500 | Ghi chú |

**Response `BanThanhPhamResponse`** gồm toàn bộ trường request và thêm:
`maSanPhamNavigationTenSanPham` (string?), `maNguyenLieuGocNavigationTenNguyenLieu` (string?), `maDonViGiaCongNavigationTenDoiTac` (string?).

### 4.2 `DanhMucVatTu`

**Request `DanhMucVatTuRequest`**

| JSON field | Type | Required / max |
|---|---|---|
| `maVatTu` | string | bắt buộc, 50 |
| `tenVatTu` | string | bắt buộc, 300 |
| `loaiVatTu` | string | bắt buộc, 30 |
| `maSanPham` | string? | 30 |
| `chieuDaiSanPham` | number? | - |
| `maNguyenLieu` | string? | 50 |
| `maBanThanhPham` | string? | 50 |
| `heSoQuyDoiTuThanhDai` | number? | - |
| `nhomVatTu1` | string? | 20 |
| `nhomVatTu2` | string? | 20 |
| `donViTinh` | string | bắt buộc, 20 |
| `trangThai` | string | bắt buộc, 20 |
| `ghiChu` | string? | 500 |

**Response `DanhMucVatTuResponse`** gồm các trường trên và thêm:
`maSanPhamNavigationTenSanPham`, `maNguyenLieuNavigationTenNguyenLieu`, `maBanThanhPhamNavigationTenBanThanhPham` (đều là `string?`).

### 4.3 `DoiTac`

**Request/response fields** (`DoiTacRequest` / `DoiTacResponse`):

| JSON field | Type | Request validation |
|---|---|---|
| `maDoiTac` | string | bắt buộc, 20 |
| `tenDoiTac` | string | bắt buộc, 200 |
| `loaiDoiTac` | string | bắt buộc, 30 |
| `diaChi` | string? | 300 |
| `soDienThoai` | string? | 20 |
| `maSoThue` | string? | 20 |
| `nguoiLienHe` | string? | 100 |

### 4.4 `KhachHang`

**Request/response fields** (`KhachHangRequest` / `KhachHangResponse`):

| JSON field | Type | Request validation |
|---|---|---|
| `maKhachHang` | string | bắt buộc, 20 |
| `tenKhachHang` | string | bắt buộc, 200 |
| `diaChi` | string? | 300 |
| `soDienThoai` | string? | 20 |
| `email` | string? | 100 |
| `maSoThue` | string? | 20 |
| `nguoiLienHe` | string? | 100 |
| `ghiChu` | string? | 500 |

### 4.5 `Kho`

**Request `KhoRequest`**

| JSON field | Type | Required / max |
|---|---|---|
| `maKho` | string | bắt buộc, 20 |
| `tenKho` | string | bắt buộc, 200 |
| `loaiKho` | string | bắt buộc, 30 |
| `diaChi` | string? | 300 |
| `maDoiTacPhuTrach` | string? | 20 |
| `ghiChu` | string? | 500 |

**Response `KhoResponse`** gồm các trường trên và thêm `maDoiTacPhuTrachNavigationTenDoiTac` (string?).

### 4.6 `NguyenLieu`

**Request `NguyenLieuRequest`**

| JSON field | Type | Required / max |
|---|---|---|
| `maNguyenLieu` | string | bắt buộc, 50 |
| `tenNguyenLieu` | string | bắt buộc, 300 |
| `loaiNguyenLieu` | string | bắt buộc, 30 |
| `maSanPham` | string? | 30 |
| `chieuDaiThanh` | number? | - |
| `maNhaCungCap` | string? | 20 |
| `ghiChu` | string? | 500 |

**Response `NguyenLieuResponse`** gồm các trường trên và thêm:
`maSanPhamNavigationTenSanPham`, `maNhaCungCapNavigationTenDoiTac` (string?).

### 4.7 `SanPham`

**Request `SanPhamRequest`**

| JSON field | Type | Required / max |
|---|---|---|
| `maSanPham` | string | bắt buộc, 30 |
| `tenSanPham` | string | bắt buộc, 200 |
| `chieuDaiSanPham` | number? | - |
| `maKhachHang` | string? | 20 |
| `moTa` | string? | 500 |
| `trangThai` | string | bắt buộc, 20 |

**Response `SanPhamResponse`** gồm các trường trên và thêm `maKhachHangNavigationTenKhachHang` (string?).

## 5. Transaction models đã định nghĩa

Các model dưới đây đã có trong Application nhưng **chưa có controller/API route public** trong source hiện tại. Frontend không thể gọi các chức năng này cho tới khi thêm controller map service.

### 5.1 Phiếu nhập

`PhieuNhapTransactionRequest`:

```json
{
  "phieuNhap": {
	"soPhieuNhap": "PN-0001",
	"ngayNhap": "2026-01-31",
	"maChungTu": "...",
	"soDonHang": "...",
	"soHoaDon": "...",
	"phieuYeuCau": "...",
	"maNcc": "...",
	"maHopDong": "...",
	"maGiaoDich": "...",
	"maKhoHang": "...",
	"maKhoXuat": "...",
	"tenPhanXuong": "...",
	"maBoPhan": "...",
	"tenBoPhan": "...",
	"userTaoPo": "...",
	"nguoiLapPhieu": "...",
	"maCdgtPhieu": "...",
	"trangThaiPhieu": "..."
  },
  "chiTietPhieuNhaps": [
	{
	  "maHang": "VT-001",
	  "dvt": "kg",
	  "soLuong": 10,
	  "tkNo": "...",
	  "tkCo": "...",
	  "maPhi": "...",
	  "donTrongThietKe": 0,
	  "tyLeDonTrongThucTeThietKe": 0,
	  "caSanXuat": "...",
	  "maySanXuat": "...",
	  "maCdgtVt": "...",
	  "maLoi": "...",
	  "tenLoi": "...",
	  "soLenhSx": "...",
	  "donHangGc": "...",
	  "giaGc": 0,
	  "tienGc": 0
	}
  ]
}
```

- Header bắt buộc: `soPhieuNhap` (30), `ngayNhap` (`DateOnly`).
- Chi tiết bắt buộc: `maHang` (50), `soLuong` (`number`).
- Các trường còn lại nullable theo `PhieuNhapHeaderRequest` và `ChiTietPhieuNhapRequest`.
- Response model dự kiến: `{ "soPhieuNhap": "...", "chiTietIds": [1, 2] }`.
- Service hiện ném `NotImplementedException`; chưa có endpoint.

### 5.2 Phiếu điều chuyển

`PhieuDieuChuyenTransactionRequest` có hai phần:

- `phieuDieuChuyen`: `maGiaoDich` bắt buộc (30), `ngayChungTu` nullable, `maKhachHang` (20), `nguoiThucHien` (100), `maKhoXuat` bắt buộc (20), `maKhoNhap` bắt buộc (20), `dienGiai` (500).
- `chiTietDieuChuyens`: mỗi item có `maVatTu` bắt buộc (50), `soLuong` bắt buộc theo model (number), các trường `donHang`, `dvt`, `tonKho`, `dvt2`, `soLuong2`, `gia`, `tien`, `giaDinhDanh`, `maNxTkNo`, `tkVatTuTkCo`, `phieuYeuCauNvl`, `ghiChu` là nullable theo giới hạn trong DTO.

Response model dự kiến:

```json
{ "maGiaoDich": "GD-0001", "chiTietIds": [1, 2] }
```

Service có kiểm tra `maKhoXuat` phải khác `maKhoNhap`, nhưng hiện vẫn chưa lưu dữ liệu và ném `NotImplementedException`; chưa có endpoint.

## 6. Domain entities và quan hệ dữ liệu

Entity là model persistence; API CRUD trả DTO response, không trả trực tiếp collection navigation. Các trường navigation phẳng được map thành tên `...NavigationTen...` như mô tả ở mục 4.

| Entity | Khóa chính | Khóa/quan hệ chính |
|---|---|---|
| `DoiTac` | `MaDoiTac` | 1-n tới `Kho`, `NguyenLieu`, `BanThanhPham`, `PhieuNhap` |
| `KhachHang` | `MaKhachHang` | 1-n tới `SanPham`, `PhieuDieuChuyen` |
| `Kho` | `MaKho` | `MaDoiTacPhuTrach` → `DoiTac`; 1-n tới phiếu nhập/điều chuyển |
| `SanPham` | `MaSanPham` | `MaKhachHang` → `KhachHang`; 1-n tới `NguyenLieu`, `BanThanhPham`, `DanhMucVatTu` |
| `NguyenLieu` | `MaNguyenLieu` | `MaSanPham` → `SanPham`; `MaNhaCungCap` → `DoiTac`; 1-n tới vật tư/bán thành phẩm |
| `BanThanhPham` | `MaBanThanhPham` | `MaSanPham` → `SanPham`; `MaNguyenLieuGoc` → `NguyenLieu`; `MaDonViGiaCong` → `DoiTac` |
| `DanhMucVatTu` | `MaVatTu` | `MaSanPham` → `SanPham`; `MaNguyenLieu` → `NguyenLieu`; `MaBanThanhPham` → `BanThanhPham`; 1-n tới chi tiết |
| `PhieuNhap` | `SoPhieuNhap` | `MaNcc` → `DoiTac`; `MaKhoHang`/`MaKhoXuat` → `Kho`; `MaGiaoDich` → `PhieuDieuChuyen`; 1-n chi tiết |
| `ChiTietPhieuNhap` | `Id` (int) | `SoPhieuNhap` → `PhieuNhap`; `MaHang` → `DanhMucVatTu` |
| `PhieuDieuChuyen` | `MaGiaoDich` | `MaKhachHang` → `KhachHang`; `MaKhoXuat`/`MaKhoNhap` → `Kho`; 1-n chi tiết |
| `ChiTietDieuChuyen` | `Id` (int) | `MaGiaoDich` → `PhieuDieuChuyen`; `MaVatTu` → `DanhMucVatTu` |

### Entity fields của phiếu và chi tiết

Các entity không có CRUD controller riêng nhưng được dùng bởi transaction models:

- `PhieuNhap`: `soPhieuNhap`, `ngayNhap`, `maChungTu`, `soDonHang`, `soHoaDon`, `phieuYeuCau`, `maNcc`, `maHopDong`, `maGiaoDich`, `maKhoHang`, `maKhoXuat`, `tenPhanXuong`, `maBoPhan`, `tenBoPhan`, `userTaoPo`, `nguoiLapPhieu`, `maCdgtPhieu`, `trangThaiPhieu`.
- `ChiTietPhieuNhap`: `id`, `soPhieuNhap`, `maHang`, `dvt`, `soLuong`, `tkNo`, `tkCo`, `maPhi`, `donTrongThietKe`, `tyLeDonTrongThucTeThietKe`, `caSanXuat`, `maySanXuat`, `maCdgtVt`, `maLoi`, `tenLoi`, `soLenhSx`, `donHangGc`, `giaGc`, `tienGc`.
- `PhieuDieuChuyen`: `maGiaoDich`, `ngayChungTu`, `maKhachHang`, `nguoiThucHien`, `maKhoXuat`, `maKhoNhap`, `dienGiai`.
- `ChiTietDieuChuyen`: `id`, `maGiaoDich`, `donHang`, `maVatTu`, `dvt`, `tonKho`, `soLuong`, `dvt2`, `soLuong2`, `gia`, `tien`, `giaDinhDanh`, `maNxTkNo`, `tkVatTuTkCo`, `phieuYeuCauNvl`, `ghiChu`.

## 7. Service interfaces dùng bởi API

### `ICrudService<TEntity, TKey, TReq, TRes>`

```text
GetPagedAsync(int page, int size, CancellationToken ct)
  -> Task<PagedResult<TRes>>
GetByIdAsync(TKey id, CancellationToken ct)
  -> Task<TRes?>
CreateAsync(TReq req, CancellationToken ct)
  -> Task<TRes>
UpdateAsync(TKey id, TReq req, CancellationToken ct)
  -> Task<TRes?>
DeleteAsync(TKey id, CancellationToken ct)
  -> Task<bool>
```

`PagedResult<T>` gồm `items`, `total`, `page`, `size`. API hiện dùng service generic này cho 7 resource CRUD.

### `IPhieuNhapTransactionService`

```text
CreateAsync(PhieuNhapTransactionRequest request, CancellationToken ct)
  -> Task<PhieuNhapTransactionResponse>
```

### `IPhieuDieuChuyenTransactionService`

```text
CreateAsync(PhieuDieuChuyenTransactionRequest request, CancellationToken ct)
  -> Task<PhieuDieuChuyenTransactionResponse>
```

Hai interface transaction đã được đăng ký/triển khai ở tầng Application/Infrastructure nhưng chưa được controller gọi trực tiếp. Frontend chỉ nên tích hợp sau khi có route và nghiệp vụ hoàn chỉnh.

## 8. Ghi chú tích hợp

1. Với các khóa ngoại, gửi mã đã tồn tại trong database; nếu mã không tồn tại hoặc bản ghi đang được tham chiếu, API có thể trả `409`.
2. Tạo mới dùng `POST` và không cần gửi navigation name (`...NavigationTen...`); các trường tên navigation là response read-only.
3. Cập nhật dùng `PUT` toàn bộ request model. Các trường nullable được phép gửi `null` để xóa giá trị nullable.
4. Không tự suy đoán enum cho `loai...` hoặc `trangThai`; hiện source chỉ validate độ dài chuỗi, chưa khai báo enum.
5. `GET /api/<resource>` không có filter/search/sort tùy chọn ngoài `page` và `size`.
6. `PhieuNhap`, `PhieuDieuChuyen`, `ChiTietPhieuNhap`, `ChiTietDieuChuyen` chưa có endpoint CRUD public trong source hiện tại.
