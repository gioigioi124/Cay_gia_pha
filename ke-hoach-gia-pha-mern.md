# Kế Hoạch Ứng Dụng MERN - Gia Phả Gia Đình 🌳

---

## 1. Tổng Quan Dự Án

Ứng dụng quản lý gia phả cho phép các gia đình xây dựng, lưu trữ và chia sẻ cây phả hệ trực tuyến. Người dùng có thể thêm thành viên, kết nối quan hệ, upload ảnh và xem cây gia phả dạng đồ họa.

---

## 2. Tech Stack

| Layer            | Công nghệ                                             | Trạng thái          |
| ---------------- | ----------------------------------------------------- | ------------------- |
| Frontend         | React + Vite, TailwindCSS v4, React Flow (cây phả hệ) | ✅ Xong             |
| Backend          | Node.js + Express.js                                  | ✅ Xong             |
| Database         | MongoDB + Mongoose                                    | ✅ Xong             |
| Auth             | JWT + bcrypt                                          | ✅ Xong             |
| Upload ảnh       | Cloudinary                                            | ⏳ Chưa tích hợp UI |
| State management | Zustand                                               | ✅ Xong             |
| UI Components    | shadcn/ui                                             | ✅ Xong             |
| HTTP Client      | Axios + interceptors                                  | ✅ Xong             |

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
  familyTreeId,   // ref -> FamilyTree
  role: "owner" | "editor" | "viewer",
  createdAt
}
```

### 🌳 FamilyTree Schema ✅

```js
{
  _id,
  name,           // "Gia phả họ Nguyễn"
  description,
  ownerId,        // ref -> User
  members: [{ type: ObjectId, ref: "Member" }],
  sharedWith: [{ userId, role }],
  createdAt
}
```

### 👨‍👩‍👧 Member Schema ✅

```js
{
  _id,
  familyTreeId,   // ref -> FamilyTree
  fullName,
  gender: "male" | "female" | "other",
  dateOfBirth,
  dateOfDeath,    // null nếu còn sống
  birthPlace,
  bio,
  avatar,
  isAlive: Boolean,

  // Quan hệ
  parents: [{ type: ObjectId, ref: "Member" }],
  spouses: [{ memberId, marriageDate, divorceDate }],
  children: [{ type: ObjectId, ref: "Member" }],

  createdBy,      // ref -> User
  createdAt
}
```

---

## 4. API Endpoints

### 🔐 Auth ✅

```
POST   /api/auth/register       ✅
POST   /api/auth/login          ✅
POST   /api/auth/logout         ✅
GET    /api/auth/me             ✅
PUT    /api/auth/change-password ✅
```

### 🌳 Family Tree ✅

```
GET    /api/trees              ✅ lấy tất cả cây của user
POST   /api/trees              ✅ tạo cây mới
GET    /api/trees/:id          ✅ chi tiết cây
PUT    /api/trees/:id          ✅ cập nhật thông tin cây
DELETE /api/trees/:id          ✅ xóa cây
POST   /api/trees/:id/share    ✅ chia sẻ với người khác
```

### 👨‍👩‍👧 Members ✅

```
GET    /api/trees/:treeId/members         ✅ danh sách thành viên
POST   /api/trees/:treeId/members         ✅ thêm thành viên
GET    /api/trees/:treeId/members/:id     ✅ chi tiết thành viên
PUT    /api/trees/:treeId/members/:id     ✅ cập nhật
DELETE /api/trees/:treeId/members/:id     ✅ xóa
POST   /api/trees/:treeId/members/:id/relationship ✅ thêm quan hệ
```

### 🔍 Search ⬜ (Tiếp theo)

```
GET    /api/trees/:treeId/members/search?q=  ⬜ tìm kiếm thành viên
```

---

## 5. Cấu Trúc Thư Mục ✅

```
Cay_gia_pha/
├── backend/                 ✅ Express App
│   ├── controllers/
│   │   ├── authController.js     ✅
│   │   ├── treeController.js     ✅
│   │   └── memberController.js   ✅
│   ├── models/
│   │   ├── User.js               ✅
│   │   ├── FamilyTree.js         ✅
│   │   └── Member.js             ✅
│   ├── routes/                   ✅
│   ├── middleware/
│   │   ├── authMiddleware.js     ✅
│   │   └── errorHandler.js       ✅
│   ├── utils/
│   │   └── cloudinary.js         ✅ (cần điền credentials)
│   └── server.js                 ✅
│
└── frontend/                ✅ React App
    └── src/
        ├── components/
        │   ├── auth/        ✅ LoginForm, RegisterForm
        │   ├── tree/        ✅ TreeCanvas, TreeNode
        │   ├── member/      ✅ MemberCard, MemberForm
        │   └── common/      ✅ Navbar, LoadingSpinner
        ├── pages/           ✅ Login, Register, Dashboard, Tree, Profile
        ├── store/           ✅ useAuthStore, useTreeStore, useMemberStore
        ├── hooks/           ✅ useAuth
        ├── services/        ✅ api.js, authService, treeService, memberService
        └── utils/           ✅ helpers.js
```

---

## 6. Tính Năng Chi Tiết

### Phase 1 – MVP (Cơ Bản)

- [x] Đăng ký / Đăng nhập bằng email + mật khẩu
- [x] Tạo và quản lý cây gia phả
- [x] Thêm/sửa/xóa thành viên
- [x] Định nghĩa quan hệ: cha mẹ, vợ/chồng, con cái (API xong)
- [x] Hiển thị cây phả hệ dạng đồ họa (dùng **React Flow**)
- [ ] **UI thêm quan hệ giữa 2 thành viên** 🔜 Tiếp theo
- [ ] **Tìm kiếm thành viên trong cây** 🔜 Tiếp theo
- [ ] **Xem tiểu sử chi tiết thành viên (drawer/modal)** 🔜 Tiếp theo

### Phase 2 – Nâng Cao

- [ ] Upload ảnh đại diện cho từng thành viên
- [ ] Chia sẻ cây với người khác (phân quyền view/edit)
- [ ] Xuất PDF / in cây gia phả

### Phase 3 – Mở Rộng

- [ ] Đăng nhập bằng Google (OAuth)
- [ ] Nhập/xuất file GEDCOM (chuẩn phả hệ quốc tế)
- [ ] Timeline sự kiện của gia đình
- [ ] Thống kê: số thế hệ, số thành viên, tuổi thọ trung bình...

---

## 7. Luồng Hoạt Động Chính ✅

```
Đăng ký/Đăng nhập ✅
      ↓
Dashboard (danh sách các cây gia phả) ✅
      ↓
Chọn / Tạo cây mới ✅
      ↓
Trang cây phả hệ (TreePage) ✅
  ├── Canvas hiển thị cây (React Flow) ✅
  ├── Thêm thành viên → điền form ✅
  ├── Click vào node → xem chi tiết / sửa ✅
  └── Kéo thả để sắp xếp layout ✅
```

---

## 8. Gợi Ý Thư Viện

| Mục đích        | Thư viện                  | Trạng thái  |
| --------------- | ------------------------- | ----------- |
| Vẽ cây phả hệ   | `@xyflow/react`           | ✅ Đã cài   |
| Form validation | `react-hook-form` + `zod` | ✅ Đã cài   |
| HTTP client     | `axios`                   | ✅ Đã cài   |
| Ngày tháng      | `dayjs`                   | ✅ Đã cài   |
| Thông báo       | `sonner` (shadcn)         | ✅ Đã cài   |
| Icons           | `lucide-react`            | ✅ Đã cài   |
| PDF export      | `html2canvas` + `jsPDF`   | ⬜ Chưa cài |

---

## 9. Bước Triển Khai

1. **Setup** – Khởi tạo project, cài dependencies, cấu hình MongoDB Atlas ✅
2. **Backend Auth** – Viết API đăng ký/đăng nhập, JWT middleware ✅
3. **Frontend Auth** – Trang login/register, lưu token, protected routes ✅
4. **CRUD Members** – API + UI thêm/sửa/xóa thành viên ✅
5. **Cây phả hệ** – Tích hợp React Flow, render nodes/edges từ dữ liệu ✅
6. **Quan hệ** – UI kết nối cha mẹ – con cái – vợ chồng 🔜 **Tiếp theo**
7. **Tìm kiếm thành viên** – Search bar trong TreePage 🔜 **Tiếp theo**
8. **Chi tiết thành viên** – Drawer xem đầy đủ thông tin 🔜 **Tiếp theo**
9. **Upload ảnh** – Tích hợp Cloudinary ⬜
10. **Chia sẻ & phân quyền** ⬜
11. **Deploy** – Frontend: Vercel, Backend: Render, DB: MongoDB Atlas ⬜

---

## 🔜 Việc Làm Tiếp Theo (Ưu Tiên)

### 1. UI Thêm Quan Hệ giữa 2 Thành Viên

- Component `RelationshipForm` cho phép chọn thành viên A → chọn loại quan hệ → chọn thành viên B
- Nút "Thêm quan hệ" trong `TreePage`
- Gọi API `POST /api/trees/:treeId/members/:id/relationship`

### 2. Tìm Kiếm Thành Viên

- Search bar trong `TreePage`
- Lọc danh sách `members` theo `fullName`
- Highlight node trùng khớp trên canvas

### 3. Drawer Chi Tiết Thành Viên

- Click vào node → mở `Sheet` (shadcn) bên phải
- Hiện đầy đủ: ảnh, tên, ngày sinh, quê quán, tiểu sử
- Hiện danh sách cha mẹ / con cái / vợ chồng có link
- Nút Sửa / Xóa ngay trong drawer
