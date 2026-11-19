# Workshop Management Frontend

Frontend for managing the seven master-data resources exposed by the backend API:
`BanThanhPham`, `DanhMucVatTu`, `DoiTac`, `KhachHang`, `Kho`, `NguyenLieu`, and
`SanPham`.

The app uses only the CRUD endpoints described in [API_DOCUMENTATION.md](./API_DOCUMENTATION.md).
It does not include mock records or seed data.

## Configuration

Set `API_URL` to the API root, including `/api`. This URL is embedded in the
client bundle by `next.config.ts`, so it is public; the backend must allow the
frontend origin through CORS:

```env
API_URL="https://t11-backend.onrender.com/api"
```

Restart the Next.js dev server after changing this value.

## Run locally

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).
