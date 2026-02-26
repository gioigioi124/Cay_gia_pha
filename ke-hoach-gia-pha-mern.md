# Kế Hoạch Ứng Dụng MERN - Gia Phả Gia Đình 🌳

---

## 1. Tổng Quan Dự Án

Ứng dụng quản lý gia phả cho phép các gia đình xây dựng, lưu trữ và chia sẻ cây phả hệ trực tuyến. Người dùng có thể thêm thành viên, kết nối quan hệ, upload ảnh và xem cây gia phả dạng đồ họa.

---

## 2. Tech Stack

| Layer            | Công nghệ                                | Trạng thái          |
| ---------------- | ---------------------------------------- | ------------------- |
| Frontend         | React + Vite, TailwindCSS v4, React Flow | ✅ Xong             |
| Backend          | Node.js + Express.js                     | ✅ Xong             |
| Database         | MongoDB + Mongoose                       | ✅ Xong             |
| Auth             | JWT + bcrypt                             | ✅ Xong             |
| Upload ảnh       | Cloudinary                               | ⏳ Chưa tích hợp UI |
| State management | Zustand                                  | ✅ Xong             |
| UI Components    | shadcn/ui + Badge                        | ✅ Xong             |
| HTTP Client      | Axios + interceptors                     | ✅ Xong             |
| Font             | Lexend (Google Fonts)                    | ✅ Xong             |
| Dark mode        | ThemeContext + toggle                    | ✅ Xong             |

---

## 3. Cấu Trúc Database (MongoDB)

### 👤 User Schema ✅

```js
{
  _id,
  email,
  password,       // đã hash bcrypt
  displayName,
  avatar,
  familyTreeId,
  role: "owner" | "editor" | "viewer",
  createdAt
}
```

### 🌳 FamilyTree Schema ✅

```js
{
  _id,
  name,
  description,
  ownerId,
  members: [{ type: ObjectId, ref: "Member" }],
  sharedWith: [{ userId, role }],
  createdAt
}
```

### 👨‍👩‍👧 Member Schema ✅

```js
{
  _id,
  familyTreeId,
  fullName,
  gender: "male" | "female" | "other",
  dateOfBirth,
  dateOfDeath,
  birthPlace,
  bio,
  avatar,
  isAlive: Boolean,
  parents: [ObjectId],
  spouses: [{ memberId, marriageDate, divorceDate }],
  children: [ObjectId],
  createdBy,
  createdAt
}
```

---

## 4. API Endpoints

### 🔐 Auth ✅

```
POST   /api/auth/register           ✅
POST   /api/auth/login              ✅
POST   /api/auth/logout             ✅
GET    /api/auth/me                 ✅
PUT    /api/auth/change-password    ✅
PUT    /api/auth/profile            ✅ (cập nhật displayName, avatar)
```

### 🌳 Family Tree ✅

```
GET    /api/trees                   ✅
POST   /api/trees                   ✅
GET    /api/trees/:id               ✅
PUT    /api/trees/:id               ✅
DELETE /api/trees/:id               ✅
POST   /api/trees/:id/share         ✅
```

### 👨‍👩‍👧 Members ✅

```
GET    /api/trees/:treeId/members                           ✅
POST   /api/trees/:treeId/members                           ✅
GET    /api/trees/:treeId/members/:id                       ✅
PUT    /api/trees/:treeId/members/:id                       ✅
DELETE /api/trees/:treeId/members/:id                       ✅
POST   /api/trees/:treeId/members/:id/relationship          ✅ (đã fix logic ngược)
```

### 🔍 Search

```
GET    /api/trees/:treeId/members/search?q=                 ⬜ (frontend search đã có, backend chưa)
```

---

## 5. Cấu Trúc Thư Mục ✅

```
Cay_gia_pha/
├── backend/
│   ├── controllers/
│   │   ├── authController.js       ✅ (+ updateProfile)
│   │   ├── treeController.js       ✅
│   │   └── memberController.js     ✅ (đã fix logic quan hệ)
│   ├── models/                     ✅
│   ├── routes/                     ✅ (+ PUT /profile)
│   ├── middleware/                 ✅
│   └── utils/cloudinary.js         ✅
│
└── frontend/
    └── src/
        ├── components/
        │   ├── auth/               ✅ LoginForm, RegisterForm
        │   ├── tree/               ✅ TreeCanvas, TreeNode, TreeStats (toggle), EditTreeModal
        │   ├── member/             ✅ MemberCard, MemberForm, MemberDetailDrawer, RelationshipForm
        │   └── common/             ✅ Navbar (dark mode toggle), LoadingSpinner
        ├── context/
        │   └── ThemeContext.jsx    ✅ Dark/Light mode
        ├── pages/                  ✅ Login, Register, Dashboard, Tree, Profile (edit name)
        ├── store/                  ✅ useAuthStore, useTreeStore (+ updateTree), useMemberStore
        ├── hooks/                  ✅ useAuth (+ fetchUser)
        ├── services/               ✅ api, authService (+ updateProfile), treeService, memberService
        └── utils/                  ✅ helpers.js
```

---

## 6. Tính Năng Chi Tiết

### Phase 1 – MVP ✅ (Hoàn Thành)

- [x] Đăng ký / Đăng nhập bằng email + mật khẩu
- [x] Tạo / sửa / xóa cây gia phả
- [x] Thêm / sửa / xóa thành viên
- [x] Thêm quan hệ: cha/mẹ, vợ/chồng, con cái (UI + API, đã fix logic)
- [x] Hiển thị cây phả hệ dạng đồ họa (React Flow)
- [x] Tìm kiếm thành viên trong cây (filter real-time)
- [x] Drawer chi tiết thành viên (xem cha/mẹ/con/vợ chồng có link)
- [x] Chỉnh sửa tên/mô tả cây (modal)
- [x] Dark mode / Light mode (toggle, lưu localStorage)
- [x] Font Lexend toàn bộ app
- [x] Thống kê cây (ẩn/hiện bằng toggle button compact)
- [x] Cập nhật hồ sơ cá nhân (displayName, đổi mật khẩu)
- [x] SEO: title, meta description, lang="vi"

### Phase 2 – Nâng Cao (Tiếp Theo)

- [ ] **Upload ảnh avatar thành viên** (Cloudinary) 🔜
- [ ] **Xuất PDF / in cây gia phả** 🔜
- [ ] **Chia sẻ cây với người dùng khác** (phân quyền) ⬜
- [ ] **Tìm kiếm backend** (`/search?q=`) ⬜

### Phase 3 – Mở Rộng

- [ ] Đăng nhập Google (OAuth)
- [ ] Nhập/xuất GEDCOM
- [ ] Timeline sự kiện gia đình
- [ ] Thống kê nâng cao (tuổi thọ, phân bố theo thế hệ)

---

## 7. Gợi Ý Thư Viện

| Mục đích        | Thư viện                  | Trạng thái      |
| --------------- | ------------------------- | --------------- |
| Vẽ cây phả hệ   | `@xyflow/react`           | ✅ Đã cài       |
| Form validation | `react-hook-form` + `zod` | ✅ Đã cài       |
| HTTP client     | `axios`                   | ✅ Đã cài       |
| Ngày tháng      | `dayjs`                   | ✅ Đã cài       |
| Thông báo       | `sonner`                  | ✅ Đã cài       |
| Icons           | `lucide-react`            | ✅ Đã cài       |
| Font            | `Lexend` (Google Fonts)   | ✅ Đã cài       |
| PDF export      | `html2canvas` + `jsPDF`   | ⬜ Chưa cài     |
| Image upload    | `Cloudinary` SDK          | ⬜ Cần tích hợp |

---

## 8. 🔜 Việc Làm Tiếp Theo (Ưu Tiên)

### 1. Upload Ảnh Avatar Thành Viên (Cloudinary)

- Input file trong `MemberForm`
- Preview ảnh trước khi upload
- Gọi API backend `/upload` → trả về URL
- Lưu URL vào `member.avatar`
- Hiển thị ảnh thật trong `MemberCard`, `TreeNode`, `MemberDetailDrawer`

### 2. Xuất PDF Cây Gia Phả

- Cài `html2canvas` + `jsPDF`
- Nút "Xuất PDF" trong `TreePage`
- Chụp màn hình canvas → tạo file PDF
- Tên file: `[tên-cây]-gia-pha.pdf`

### 3. Xác Nhận Email / Bảo Mật Hơn

- Thêm rate limiting với `express-rate-limit`
- Validation đầu vào chặt hơn phía backend

---

## 9. Trạng Thái Triển Khai

| Mục      | Nền tảng      | Trạng thái       |
| -------- | ------------- | ---------------- |
| Frontend | Vercel        | ⬜ Chưa deploy   |
| Backend  | Render        | ⬜ Chưa deploy   |
| Database | MongoDB Atlas | ⬜ Chưa cấu hình |
| Domain   | —             | ⬜ Chưa          |
