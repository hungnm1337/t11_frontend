# Workshop Management Frontend

Frontend for managing the seven master-data resources exposed by the backend API:
`BanThanhPham`, `DanhMucVatTu`, `DoiTac`, `KhachHang`, `Kho`, `NguyenLieu`, and
`SanPham`.

The app uses only the CRUD endpoints described in [API_DOCUMENTATION.md](./API_DOCUMENTATION.md).
It does not include mock records or seed data.

## Configuration

Set `NEXT_PUBLIC_API_URL` to the API root, including `/api`. The browser calls
this API directly, so the backend must allow the frontend origin through CORS:

```env
NEXT_PUBLIC_API_URL="https://localhost:7017/api"
```

For local HTTPS development, ensure the API certificate is trusted by the browser.

## Run locally

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).
