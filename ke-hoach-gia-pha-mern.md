# Kế Hoạch Ứng Dụng MERN - Gia Phả Gia Đình 🌳

---

## 1. Tổng Quan Dự Án

Ứng dụng quản lý gia phả cho phép các gia đình xây dựng, lưu trữ và chia sẻ cây phả hệ trực tuyến. Người dùng có thể thêm thành viên, kết nối quan hệ, upload ảnh và xem cây gia phả dạng đồ họa.

---

## 2. Tech Stack

| Layer | Công nghệ |
|---|---|
| Frontend | React + Vite, TailwindCSS, React Flow (cây phả hệ) |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcrypt |
| Upload ảnh | Cloudinary hoặc Multer + local |
| State management | Redux Toolkit hoặc Zustand |

---

## 3. Cấu Trúc Database (MongoDB)

### 👤 User Schema
```js
{
  _id, 
  email,
  password,       // đã hash
  displayName,
  avatar,
  familyTreeId,   // ref -> FamilyTree
  role: "owner" | "editor" | "viewer",
  createdAt
}
```

### 🌳 FamilyTree Schema
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

### 👨‍👩‍👧 Member Schema
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

### 🔐 Auth
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me
PUT    /api/auth/change-password
```

### 🌳 Family Tree
```
GET    /api/trees              → lấy tất cả cây của user
POST   /api/trees              → tạo cây mới
GET    /api/trees/:id          → chi tiết cây
PUT    /api/trees/:id          → cập nhật thông tin cây
DELETE /api/trees/:id          → xóa cây
POST   /api/trees/:id/share    → chia sẻ với người khác
```

### 👨‍👩‍👧 Members
```
GET    /api/trees/:treeId/members         → danh sách thành viên
POST   /api/trees/:treeId/members         → thêm thành viên
GET    /api/trees/:treeId/members/:id     → chi tiết thành viên
PUT    /api/trees/:treeId/members/:id     → cập nhật
DELETE /api/trees/:treeId/members/:id     → xóa
POST   /api/trees/:treeId/members/:id/relationship → thêm quan hệ
```

---

## 5. Cấu Trúc Thư Mục

```
family-tree-app/
├── client/                  # React App
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/        # Login, Register forms
│   │   │   ├── tree/        # TreeCanvas, TreeNode
│   │   │   ├── member/      # MemberCard, MemberForm
│   │   │   └── common/      # Navbar, Modal, Button...
│   │   ├── pages/
│   │   │   ├── LoginPage
│   │   │   ├── RegisterPage
│   │   │   ├── DashboardPage
│   │   │   ├── TreePage      # Xem cây phả hệ
│   │   │   └── ProfilePage
│   │   ├── store/           # Redux / Zustand
│   │   ├── hooks/
│   │   ├── services/        # API calls (axios)
│   │   └── utils/
│
└── server/                  # Express App
    ├── controllers/
    │   ├── authController.js
    │   ├── treeController.js
    │   └── memberController.js
    ├── models/
    │   ├── User.js
    │   ├── FamilyTree.js
    │   └── Member.js
    ├── routes/
    ├── middleware/
    │   ├── authMiddleware.js   # verify JWT
    │   └── errorHandler.js
    ├── utils/
    └── server.js
```

---

## 6. Tính Năng Chi Tiết

### Phase 1 – MVP (Cơ Bản)
- Đăng ký / Đăng nhập bằng email + mật khẩu
- Tạo và quản lý cây gia phả
- Thêm/sửa/xóa thành viên
- Định nghĩa quan hệ: cha mẹ, vợ/chồng, con cái
- Hiển thị cây phả hệ dạng đồ họa (dùng **React Flow**)

### Phase 2 – Nâng Cao
- Upload ảnh đại diện cho từng thành viên
- Tìm kiếm thành viên trong cây
- Chia sẻ cây với người khác (phân quyền view/edit)
- Xem tiểu sử chi tiết từng thành viên
- Xuất PDF / in cây gia phả

### Phase 3 – Mở Rộng
- Đăng nhập bằng Google (OAuth)
- Nhập/xuất file GEDCOM (chuẩn phả hệ quốc tế)
- Timeline sự kiện của gia đình
- Thống kê: số thế hệ, số thành viên, tuổi thọ trung bình...

---

## 7. Luồng Hoạt Động Chính

```
Đăng ký/Đăng nhập
      ↓
Dashboard (danh sách các cây gia phả)
      ↓
Chọn / Tạo cây mới
      ↓
Trang cây phả hệ (TreePage)
  ├── Canvas hiển thị cây (React Flow)
  ├── Thêm thành viên → điền form
  ├── Click vào node → xem chi tiết / sửa
  └── Kéo thả để sắp xếp layout
```

---

## 8. Gợi Ý Thư Viện

| Mục đích | Thư viện |
|---|---|
| Vẽ cây phả hệ | `react-flow-renderer` hoặc `d3.js` |
| Form validation | `react-hook-form` + `zod` |
| HTTP client | `axios` |
| Ngày tháng | `dayjs` |
| Thông báo | `react-hot-toast` |
| Icons | `lucide-react` |
| PDF export | `html2canvas` + `jsPDF` |

---

## 9. Bước Triển Khai

1. **Setup** – Khởi tạo project, cài dependencies, cấu hình MongoDB Atlas
2. **Backend Auth** – Viết API đăng ký/đăng nhập, JWT middleware
3. **Frontend Auth** – Trang login/register, lưu token, protected routes
4. **CRUD Members** – API + UI thêm/sửa/xóa thành viên
5. **Cây phả hệ** – Tích hợp React Flow, render nodes/edges từ dữ liệu
6. **Quan hệ** – Logic kết nối cha mẹ – con cái – vợ chồng
7. **Upload ảnh** – Tích hợp Cloudinary
8. **Chia sẻ & phân quyền**
9. **Deploy** – Frontend: Vercel, Backend: Render, DB: MongoDB Atlas
