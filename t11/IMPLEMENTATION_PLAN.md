IMPLEMENTATION_PLAN.md# WORKSHOP MANAGEMENT SYSTEM
## Project Implementation Plan – Next.js

## 1. Tổng quan dự án

### 1.1. Mục tiêu

Xây dựng hệ thống quản lý hoạt động của một xưởng cơ khí, giúp quản lý đơn hàng, nguyên vật liệu, nhập xuất kho và theo dõi tiến độ công việc.

Hệ thống phục vụ khoảng 1–10 người dùng, bao gồm:
- **Manager:** Quản lý toàn bộ hoạt động, đơn hàng, kho nguyên vật liệu, nhân viên và báo cáo.
- **Employee:** Nhân viên thao tác theo nghiệp vụ được cấp quyền, xem đơn hàng và cập nhật tiến độ công việc.

Ưu tiên xây dựng MVP có thể sử dụng thực tế, dễ mở rộng và dễ bảo trì.

### 1.2. Công nghệ sử dụng

| Thành phần | Công nghệ |
|---|---|
| Frontend | Next.js App Router |
| Language | TypeScript |
| UI | React |
| Styling | Tailwind CSS + CSS Variables |
| Icons | Lucide React |
| Backend | Next.js Server Actions / Route Handlers |
| Database | PostgreSQL |
| ORM | Prisma |
| Authentication | Auth.js |
| Validation | Zod |
| Form | React Hook Form |
| Charts | Recharts |
| Notifications | Sonner |

Nguyên tắc: Không cài thêm thư viện nếu chức năng có thể giải quyết tốt bằng công nghệ hiện có.

---

# 2. Phân quyền hệ thống

## 2.1. Manager – Quản lý

Có quyền:
- Xem dashboard tổng quan.
- Tạo, sửa, xóa đơn hàng.
- Quản lý nguyên vật liệu.
- Quản lý nhập kho, xuất kho, điều chỉnh tồn kho.
- Quản lý nhân viên.
- Xem lịch sử giao dịch.
- Xem báo cáo thống kê.
- Quản lý trạng thái đơn hàng.
- Quản lý tài khoản và phân quyền.

## 2.2. Employee – Nhân viên

Có quyền:
- Đăng nhập hệ thống.
- Xem dashboard cá nhân.
- Xem danh sách đơn hàng được phép truy cập.
- Xem chi tiết đơn hàng.
- Cập nhật tiến độ đơn hàng nếu được cấp quyền.
- Xem thông tin nguyên vật liệu.
- Xem số lượng tồn kho.
- Tạo yêu cầu xuất nguyên vật liệu (nếu được cấp quyền).
- Xem lịch sử thao tác của bản thân.

Không được:
- Quản lý tài khoản.
- Xóa dữ liệu quan trọng.
- Điều chỉnh tồn kho trực tiếp.
- Truy cập các trang quản trị khi không có quyền.

**Lưu ý:** Phân quyền phải được kiểm tra ở backend, không chỉ ẩn nút hoặc menu ở frontend.

---

# 3. Cấu trúc chức năng

## 3.1. Authentication

Các trang:
- `/login`
- `/forgot-password` (có thể triển khai ở phase sau).

Yêu cầu:
- Đăng nhập bằng tài khoản và mật khẩu.
- Password phải được hash an toàn.
- Kiểm tra trạng thái tài khoản.
- Phân quyền Manager / Employee.
- Bảo vệ các route.
- Tự động chuyển hướng theo quyền.
- Có chức năng đăng xuất.
- Session an toàn, không lưu thông tin nhạy cảm vào localStorage.

## 3.2. Dashboard quản lý

Route: `/manager/dashboard`

Các thông tin cần hiển thị:

### Thẻ thống kê

- Tổng số đơn hàng.
- Đơn hàng đang thực hiện.
- Đơn hàng hoàn thành.
- Đơn hàng quá hạn.
- Tổng số loại nguyên vật liệu.
- Tổng giá trị tồn kho.
- Nguyên vật liệu sắp hết.

### Biểu đồ

- Số lượng đơn hàng theo tháng.
- Trạng thái đơn hàng.
- Giá trị nhập/xuất kho.
- Xu hướng sử dụng nguyên vật liệu.

### Bảng dữ liệu

- Đơn hàng mới nhất.
- Đơn hàng cần xử lý.
- Nguyên vật liệu sắp hết.
- Hoạt động gần đây.

Dashboard phải ưu tiên thông tin quan trọng, không nhồi nhét quá nhiều biểu đồ.

## 3.3. Quản lý đơn hàng

Route: `/manager/orders`

Chức năng:
- Danh sách đơn hàng.
- Tìm kiếm theo mã đơn hàng.
- Lọc theo trạng thái.
- Lọc theo thời gian.
- Phân trang.
- Tạo đơn hàng.
- Chỉnh sửa đơn hàng.
- Xem chi tiết.
- Cập nhật trạng thái.
- Hủy đơn hàng.

Thông tin đơn hàng:

- Mã đơn hàng.
- Tên khách hàng.
- Số điện thoại.
- Địa chỉ.
- Tên sản phẩm / hạng mục gia công.
- Số lượng.
- Ngày tạo.
- Ngày dự kiến hoàn thành.
- Người phụ trách.
- Ghi chú.
- Trạng thái.

Trạng thái đề xuất:

1. Pending – Chờ xử lý.
2. Confirmed – Đã xác nhận.
3. In Progress – Đang sản xuất.
4. Completed – Hoàn thành.
5. Delivered – Đã bàn giao.
6. Cancelled – Đã hủy.

Chi tiết đơn hàng cần có:
- Thông tin khách hàng.
- Thông tin sản phẩm.
- Tiến độ thực hiện.
- Nguyên vật liệu sử dụng.
- Lịch sử thay đổi trạng thái.

## 3.4. Quản lý nguyên vật liệu

Route: `/manager/materials`

Chức năng:
- Danh sách nguyên vật liệu.
- Tìm kiếm.
- Lọc theo danh mục.
- Thêm nguyên vật liệu.
- Chỉnh sửa thông tin.
- Xem chi tiết.
- Theo dõi tồn kho.
- Cảnh báo tồn kho thấp.

Thông tin nguyên vật liệu:

- Mã nguyên vật liệu (SKU).
- Tên.
- Danh mục.
- Đơn vị tính (kg, mét, cái, hộp...).
- Số lượng tồn kho.
- Số lượng tối thiểu.
- Giá nhập tham khảo.
- Nhà cung cấp.
- Mô tả.
- Trạng thái.

Quy tắc:
- Không cho phép tồn kho âm.
- Cảnh báo khi số lượng tồn kho nhỏ hơn hoặc bằng mức tối thiểu.
- Không xóa nguyên vật liệu đã phát sinh giao dịch kho.
- Việc thay đổi tồn kho phải thông qua giao dịch nhập, xuất hoặc điều chỉnh có ghi lịch sử.

## 3.5. Nhập kho và xuất kho

Routes:
- `/manager/inventory`
- `/manager/inventory/import`
- `/manager/inventory/export`

Nhập kho:
- Chọn nguyên vật liệu.
- Số lượng nhập.
- Đơn giá.
- Nhà cung cấp.
- Ngày nhập.
- Người thực hiện.
- Ghi chú.

Xuất kho:
- Chọn nguyên vật liệu.
- Số lượng xuất.
- Đơn hàng liên quan (nếu có).
- Người nhận.
- Ngày xuất.
- Người thực hiện.
- Ghi chú.

Lịch sử kho:
- Mã giao dịch.
- Loại giao dịch.
- Nguyên vật liệu.
- Số lượng.
- Thời gian.
- Người thực hiện.
- Đơn hàng liên quan.

**Yêu cầu quan trọng:**

Mỗi giao dịch nhập/xuất phải cập nhật tồn kho trong cùng một database transaction. Không để xảy ra tình trạng ghi nhận giao dịch thành công nhưng số lượng tồn kho không được cập nhật.

## 3.6. Quản lý nhân viên

Route: `/manager/employees`

Chức năng:
- Danh sách nhân viên.
- Thêm tài khoản.
- Chỉnh sửa thông tin.
- Khóa / mở khóa tài khoản.
- Phân quyền.
- Xem lịch sử thao tác.

Thông tin:
- Họ tên.
- Username.
- Email.
- Số điện thoại.
- Vai trò.
- Trạng thái.
- Ngày tạo.

## 3.7. Dashboard nhân viên

Route: `/employee/dashboard`

Hiển thị:
- Công việc được giao.
- Đơn hàng đang phụ trách.
- Công việc cần xử lý.
- Tiến độ công việc.
- Thông báo tồn kho thấp liên quan.
- Lịch sử hoạt động cá nhân.

Nhân viên không nhìn thấy các số liệu quản trị nhạy cảm như tổng giá trị kho hoặc báo cáo doanh thu nếu không được cấp quyền.

## 3.8. Báo cáo

Route: `/manager/reports`

Bao gồm:
- Thống kê đơn hàng theo thời gian.
- Thống kê đơn hàng theo trạng thái.
- Thống kê nhập kho.
- Thống kê xuất kho.
- Thống kê nguyên vật liệu tiêu thụ.
- Tổng giá trị tồn kho.

Có thể bổ sung xuất Excel ở phase mở rộng.

---

# 4. Database Design

Sử dụng PostgreSQL + Prisma.

Các bảng đề xuất:

### User
- id
- fullName
- username
- email
- passwordHash
- phone
- role
- isActive
- createdAt
- updatedAt

### Order
- id
- orderCode
- customerName
- customerPhone
- customerAddress
- description
- quantity
- startDate
- expectedDate
- completedDate
- status
- assignedToId
- createdById
- createdAt
- updatedAt

### MaterialCategory
- id
- name
- description
- createdAt

### Material
- id
- materialCode
- name
- categoryId
- unit
- quantity
- minQuantity
- unitPrice
- supplier
- description
- createdAt
- updatedAt

### InventoryTransaction
- id
- transactionCode
- materialId
- orderId (nullable)
- type (IMPORT / EXPORT / ADJUSTMENT)
- quantity
- unitPrice
- note
- performedById
- createdAt

### OrderMaterial
- id
- orderId
- materialId
- quantityRequired
- quantityUsed
- createdAt

### OrderStatusHistory
- id
- orderId
- oldStatus
- newStatus
- changedById
- note
- createdAt

### ActivityLog
- id
- userId
- action
- entityType
- entityId
- description
- createdAt

Yêu cầu:
- Sử dụng UUID hoặc CUID cho ID.
- Tạo foreign key và index hợp lý.
- Không lưu số lượng tồn kho bằng cách tính tổng toàn bộ lịch sử mỗi lần truy vấn.
- Material.quantity là số tồn hiện tại, InventoryTransaction là lịch sử giao dịch.
- Có database migration.
- Có seed dữ liệu mẫu.
- Đảm bảo tính nhất quán khi cập nhật tồn kho bằng transaction và cơ chế chống xuất kho vượt tồn.

---

# 5. UI/UX Design System

## 5.1. Định hướng giao diện

Thiết kế theo phong cách:
- Enterprise Dashboard.
- Minimalist.
- Professional.
- Clean and functional.
- Dễ nhìn khi sử dụng trong thời gian dài.

Tham khảo phong cách phần mềm quản trị doanh nghiệp, không sao chép nguyên giao diện của sản phẩm khác.

Tránh:
- Gradient quá nhiều.
- Glassmorphism.
- Quá nhiều card lồng nhau.
- Border radius quá lớn.
- Icon xuất hiện ở mọi vị trí.
- Màu sắc quá sặc sỡ.
- Các thành phần trang trí không có ý nghĩa.
- Animation không cần thiết.
- Layout có cảm giác AI-generated.

## 5.2. Color System

Sử dụng CSS Variables làm nguồn màu duy nhất.

Màu đề xuất:

```css
:root {
  --background: #f8fafc;
  --surface: #ffffff;
  --surface-muted: #f1f5f9;

  --primary: #2563eb;
  --primary-hover: #1d4ed8;

  --text-primary: #0f172a;
  --text-secondary: #64748b;
  --text-muted: #94a3b8;

  --border: #e2e8f0;

  --success: #16a34a;
  --warning: #d97706;
  --danger: #dc2626;
  --info: #0284c7;
}
```

Không hardcode màu tùy tiện trong từng component.

## 5.3. Typography

- Font: Inter hoặc Geist.
- Heading rõ ràng.
- Body text dễ đọc.
- Số liệu dashboard cần dễ quan sát.
- Không sử dụng quá nhiều font weight.

## 5.4. Layout

Desktop:
- Sidebar bên trái.
- Header trên cùng.
- Breadcrumb.
- Main content.
- Responsive cho tablet và mobile.

Sidebar:
- Dashboard.
- Đơn hàng.
- Nguyên vật liệu.
- Nhập / xuất kho.
- Nhân viên.
- Báo cáo.
- Cài đặt.

Menu hiển thị theo role.

## 5.5. Component dùng chung

Xây dựng các component tái sử dụng:

- Button
- Input
- Select
- Textarea
- SearchInput
- DataTable
- Pagination
- StatusBadge
- ConfirmDialog
- Modal
- Drawer
- Dropdown
- DatePicker
- FormField
- EmptyState
- ErrorState
- Skeleton
- LoadingSpinner
- StatCard
- PageHeader
- Breadcrumb
- Sidebar
- Header

Không tạo component riêng nếu component đã tồn tại và có thể tái sử dụng bằng props.

---

# 6. State Management – Bắt buộc chú ý

Không sử dụng useState một cách tùy tiện.

## 6.1. Nguyên tắc

Chỉ sử dụng useState khi thực sự cần quản lý state cục bộ.

Ví dụ phù hợp:
- Modal đang mở hay đóng.
- Tab đang được chọn.
- Trạng thái hiển thị sidebar mobile.
- Giá trị filter tạm thời.
- Search input.
- Trạng thái dropdown.

Ví dụ không nên:
- Lưu dữ liệu server vào nhiều useState khác nhau.
- Tạo nhiều state chứa dữ liệu có thể tính toán từ state khác.
- Sử dụng useEffect để đồng bộ những state có thể tính toán trực tiếp.
- Dùng useState cho những giá trị không cần gây re-render.

## 6.2. Quản lý dữ liệu

Phân biệt rõ:

**Server State:**
- Danh sách đơn hàng.
- Nguyên vật liệu.
- Thông tin người dùng.
- Lịch sử nhập xuất kho.

Sử dụng Server Components để tải dữ liệu ban đầu. Với các màn hình tương tác nhiều, có thể dùng TanStack Query để quản lý cache, refetch và mutation.

**Client State:**
- Modal.
- Dropdown.
- Tabs.
- Form đang nhập.
- Bộ lọc chưa áp dụng.

Sử dụng useState hoặc useReducer tùy độ phức tạp.

Không đưa toàn bộ ứng dụng vào một Context hoặc một global store.

## 6.3. Quy tắc tối ưu React

- Component nhỏ, đúng trách nhiệm.
- Hạn chế truyền props không cần thiết.
- Không khai báo component con bên trong component cha nếu không cần.
- Sử dụng useMemo khi có tính toán thực sự tốn kém.
- Sử dụng useCallback khi cần ổn định reference trong tình huống phù hợp.
- Sử dụng React.memo có chọn lọc.
- Tránh tạo object/function mới không cần thiết trong các component render thường xuyên.
- Không dùng useEffect thay thế cho event handler hoặc derived state.
- Không fetch dữ liệu trùng lặp.
- Không sử dụng client component cho toàn bộ page.

---

# 7. Performance – Mục tiêu 60 FPS

Mục tiêu là giao diện phản hồi mượt mà, hướng đến 60 FPS trên thiết bị phổ thông.

## 7.1. Rendering

- Ưu tiên Server Components.
- Chỉ thêm "use client" ở component cần tương tác.
- Tránh re-render toàn bộ page khi một modal thay đổi.
- Không render hàng nghìn dòng dữ liệu cùng lúc.
- Sử dụng pagination hoặc virtualization khi cần.
- Tránh DOM quá lớn.

## 7.2. Animation

Ưu tiên:
- Transform.
- Opacity.
- CSS transition.
- CSS animation nhẹ.

Hạn chế:
- Animation liên tục.
- Box-shadow animation nặng.
- Filter blur lớn.
- Layout animation gây reflow liên tục.
- Nhiều hiệu ứng xuất hiện đồng thời.

Thời gian transition thông thường: 150–250ms.

Tôn trọng `prefers-reduced-motion`.

## 7.3. Data fetching

- Không fetch dữ liệu không cần thiết.
- Phân trang tại server.
- Chỉ truy vấn các field cần sử dụng.
- Có index cho các field thường xuyên tìm kiếm và lọc.
- Cache dữ liệu phù hợp.
- Revalidate sau mutation thay vì tải lại toàn bộ ứng dụng.

## 7.4. Kiểm tra hiệu năng

Sử dụng:
- Chrome Performance.
- React Profiler.
- Lighthouse.
- Web Vitals.

Mục tiêu tham khảo:
- Không có long task không cần thiết trong thao tác thông thường.
- Animation đạt gần 60 FPS trên thiết bị kiểm thử.
- Không có CLS đáng kể.
- LCP dưới 2.5 giây trong điều kiện kiểm thử phù hợp.
- INP dưới 200ms.

Không tuyên bố đạt 60 FPS nếu chưa kiểm thử thực tế.

---

# 8. Loading Skeleton và UI States

Mọi trang lấy dữ liệu từ server phải có trạng thái tải phù hợp.

## 8.1. Skeleton

Tạo skeleton riêng cho:
- Dashboard cards.
- Chart.
- Table rows.
- Material list.
- Order detail.
- Profile.

Không sử dụng một spinner giữa màn hình cho mọi trường hợp.

## 8.2. Empty State

Ví dụ:
- Chưa có đơn hàng.
- Chưa có nguyên vật liệu.
- Chưa có lịch sử giao dịch.
- Không tìm thấy dữ liệu.

Có hướng dẫn hành động tiếp theo.

## 8.3. Error State

- Hiển thị thông báo dễ hiểu.
- Có nút thử lại nếu phù hợp.
- Không hiển thị stack trace hoặc lỗi database cho người dùng.
- Có logging phía server.

## 8.4. Mutation State

Khi tạo hoặc cập nhật:
- Disable nút submit trong lúc xử lý.
- Có loading indicator.
- Ngăn gửi form nhiều lần.
- Hiển thị thông báo thành công/thất bại.
- Không xóa dữ liệu form khi request thất bại.

---

# 9. Project Folder Structure

Tổ chức source code rõ ràng:

```text
src/
├── app/
│   ├── (auth)/
│   │   └── login/
│   ├── (dashboard)/
│   │   ├── manager/
│   │   │   ├── dashboard/
│   │   │   ├── orders/
│   │   │   ├── materials/
│   │   │   ├── inventory/
│   │   │   ├── employees/
│   │   │   └── reports/
│   │   └── employee/
│   │       └── dashboard/
│   ├── api/
│   ├── layout.tsx
│   └── globals.css
│
├── components/
│   ├── ui/
│   ├── layout/
│   ├── dashboard/
│   ├── orders/
│   ├── materials/
│   └── inventory/
│
├── features/
│   ├── auth/
│   ├── orders/
│   ├── materials/
│   ├── inventory/
│   └── employees/
│
├── lib/
│   ├── auth/
│   ├── prisma.ts
│   ├── validations/
│   └── utils/
│
├── hooks/
├── types/
└── constants/

prisma/
├── schema.prisma
├── migrations/
└── seed.ts
```

Có thể điều chỉnh cấu trúc khi cần nhưng phải giữ nguyên nguyên tắc phân tách UI, nghiệp vụ, dữ liệu và validation.

---

# 10. Implementation Roadmap

Không code tất cả cùng lúc. Chia thành từng phase, hoàn thành và kiểm thử trước khi chuyển tiếp.

## Phase 1 – Project Foundation

- Khởi tạo Next.js.
- Cấu hình TypeScript.
- Cấu hình Tailwind.
- Thiết lập CSS Variables.
- Tạo UI component cơ bản.
- Tạo layout dashboard.
- Tạo sidebar và header.
- Responsive cơ bản.
- Cấu hình Prisma và PostgreSQL.
- Thiết lập môi trường development.

**Deliverable:** Project chạy được, có layout hoàn chỉnh và design system thống nhất.

## Phase 2 – Authentication & Authorization

- Thiết kế User model.
- Tích hợp Auth.js.
- Đăng nhập.
- Đăng xuất.
- Session.
- Role Manager / Employee.
- Route protection.
- Backend permission checks.
- Seed tài khoản mẫu.

**Deliverable:** Hai loại tài khoản có thể đăng nhập và truy cập đúng chức năng.

## Phase 3 – Material Management

- Database Material.
- Danh mục nguyên vật liệu.
- Danh sách nguyên vật liệu.
- Tìm kiếm và lọc.
- Thêm / sửa nguyên vật liệu.
- Chi tiết nguyên vật liệu.
- Cảnh báo tồn kho thấp.

**Deliverable:** Quản lý được toàn bộ danh mục nguyên vật liệu.

## Phase 4 – Inventory Management

- Nhập kho.
- Xuất kho.
- Điều chỉnh tồn kho.
- Lịch sử giao dịch.
- Liên kết đơn hàng.
- Database transaction.
- Kiểm tra tồn kho.
- Kiểm tra các trường hợp xuất kho đồng thời.

**Deliverable:** Hệ thống nhập xuất kho chính xác và có lịch sử truy vết.

## Phase 5 – Order Management

- Tạo đơn hàng.
- Chỉnh sửa đơn hàng.
- Danh sách đơn hàng.
- Tìm kiếm và lọc.
- Chi tiết đơn hàng.
- Phân công nhân viên.
- Quản lý trạng thái.
- Lịch sử trạng thái.
- Liên kết nguyên vật liệu.

**Deliverable:** Có thể quản lý đơn hàng từ lúc tạo đến khi hoàn thành.

## Phase 6 – Dashboard & Reports

- Dashboard Manager.
- Dashboard Employee.
- Thống kê đơn hàng.
- Thống kê kho.
- Biểu đồ.
- Hoạt động gần đây.
- Cảnh báo.
- Tối ưu truy vấn.

**Deliverable:** Dashboard hiển thị dữ liệu thực từ database.

## Phase 7 – Testing & Optimization

- Kiểm thử authentication.
- Kiểm thử phân quyền.
- Kiểm thử CRUD.
- Kiểm thử nhập xuất kho.
- Kiểm thử đồng thời.
- Kiểm thử responsive.
- Kiểm tra loading skeleton.
- Kiểm tra performance.
- Kiểm tra lỗi bảo mật.
- Kiểm tra dữ liệu đầu vào.

**Deliverable:** MVP đủ điều kiện triển khai thực tế.

## Phase 8 – Deployment

- Chuẩn bị production environment.
- Cấu hình database production.
- Cấu hình environment variables.
- Chạy migration.
- Build production.
- Dockerize ứng dụng nếu cần.
- Thiết lập backup database.
- Kiểm tra logging và lỗi production.

**Deliverable:** Hệ thống có thể triển khai và sử dụng thực tế.

---

# 11. Testing Checklist

Trước khi hoàn thành mỗi phase, phải kiểm tra:

### Authentication
- [ ] Không đăng nhập được với mật khẩu sai.
- [ ] Tài khoản bị khóa không thể đăng nhập.
- [ ] Employee không thể truy cập Manager bằng cách nhập URL.
- [ ] Backend không cho phép gọi API vượt quyền.

### Orders
- [ ] Tạo đơn hàng.
- [ ] Cập nhật đơn hàng.
- [ ] Hủy đơn hàng.
- [ ] Không cho chuyển trạng thái không hợp lệ.
- [ ] Lưu lịch sử thay đổi.

### Materials
- [ ] Thêm vật liệu.
- [ ] Sửa vật liệu.
- [ ] Không cho số lượng âm.
- [ ] Cảnh báo tồn kho thấp.

### Inventory
- [ ] Nhập kho cập nhật số lượng chính xác.
- [ ] Xuất kho cập nhật số lượng chính xác.
- [ ] Không xuất vượt tồn kho.
- [ ] Không cập nhật một phần khi transaction thất bại.
- [ ] Có lịch sử người thực hiện.
- [ ] Không xảy ra sai lệch tồn kho khi có hai yêu cầu xuất đồng thời.

### UI/UX
- [ ] Không có layout shift đáng kể.
- [ ] Có skeleton.
- [ ] Có empty state.
- [ ] Có error state.
- [ ] Form có validation.
- [ ] Không có lỗi console.
- [ ] Responsive.
- [ ] Animation mượt.

---

# 12. Quy tắc bắt buộc dành cho AI Agent

Đây là các quy tắc phải tuân thủ trong toàn bộ quá trình code.

### Code Quality

1. Sử dụng TypeScript strict mode.
2. Không sử dụng `any` tùy tiện.
3. Không viết toàn bộ logic vào một component.
4. Không lặp lại code có thể tái sử dụng.
5. Tách business logic khỏi UI.
6. Tách validation khỏi component.
7. Không hardcode dữ liệu nghiệp vụ trong production.
8. Không để lộ secret hoặc database credentials.
9. Không bỏ qua lỗi TypeScript và ESLint.
10. Không tự ý thay đổi kiến trúc khi chưa có lý do.

### UI/UX

1. Phải thống nhất CSS toàn dự án.
2. Mọi component dùng chung phải sử dụng design tokens.
3. Không lạm dụng icon.
4. Không sử dụng emoji thay cho icon nghiệp vụ.
5. Không sử dụng quá nhiều màu sắc.
6. Không tạo animation không cần thiết.
7. Ưu tiên trải nghiệm desktop nhưng vẫn phải responsive.
8. Các trang phải có loading, empty và error state.
9. Không tạo giao diện chỉ đẹp trên screenshot nhưng khó sử dụng thực tế.

### React Performance

1. Không sử dụng `"use client"` cho toàn bộ page.
2. Ưu tiên Server Components.
3. Dùng useState đúng mục đích.
4. Không tạo useEffect không cần thiết.
5. Không tạo state trùng lặp.
6. Không fetch cùng một dữ liệu nhiều lần.
7. Không re-render component không liên quan.
8. Tối ưu danh sách lớn.
9. Không sử dụng CSS animation gây layout recalculation liên tục.
10. Kiểm tra bằng React Profiler khi có hiện tượng render chậm.

### Development Workflow

Sau mỗi phase, AI Agent phải:

1. Báo cáo những file đã tạo hoặc thay đổi.
2. Liệt kê chức năng đã hoàn thành.
3. Kiểm tra TypeScript.
4. Kiểm tra ESLint.
5. Chạy build nếu phù hợp.
6. Ghi lại lỗi còn tồn tại.
7. Cập nhật tiến độ roadmap.
8. Không chuyển sang phase tiếp theo nếu phase hiện tại còn lỗi nghiêm trọng.

---

# 13. Tiêu chí hoàn thành MVP

MVP được xem là hoàn thành khi:

- Manager và Employee đăng nhập được.
- Phân quyền chính xác.
- Manager quản lý được đơn hàng.
- Manager quản lý được nguyên vật liệu.
- Có thể nhập và xuất kho.
- Tồn kho luôn chính xác.
- Nhân viên xem và cập nhật công việc theo quyền.
- Dashboard hiển thị dữ liệu thực.
- Có lịch sử thao tác.
- Giao diện thống nhất.
- Có Skeleton Loading.
- Không có lỗi nghiêm trọng.
- Có thể build production.
- Có hướng dẫn triển khai và sử dụng.

**Ưu tiên thứ tự:** Tính chính xác nghiệp vụ → Bảo mật → Trải nghiệm sử dụng → Hiệu năng → Hiệu ứng giao diện.

Không hy sinh tính chính xác của dữ liệu kho để đổi lấy UI hoặc tốc độ phát triển.