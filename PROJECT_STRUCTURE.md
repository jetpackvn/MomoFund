# 📱 MomoFund — Hướng Dẫn Cấu Trúc Project

> **MomoFund** là ứng dụng quản lý quỹ nhóm (group fund management) được xây dựng bằng **React Native + Expo**, hỗ trợ chạy trên Android, iOS và Web.

---

## 🗂️ Tổng Quan Cấu Trúc Thư Mục

```
MomoFund/
├── app/               ← Màn hình & điều hướng (routing)
├── assets/            ← Tài nguyên tĩnh (ảnh, icon, font)
├── components/        ← Giao diện tái sử dụng
├── constants/         ← Hằng số & cấu hình theme
├── hooks/             ← Custom React Hooks
├── lib/               ← Khởi tạo thư viện bên ngoài (Firebase)
├── services/          ← Logic nghiệp vụ (Business Logic)
├── types/             ← Kiểu dữ liệu TypeScript
├── utils/             ← Hàm tiện ích dùng chung
├── app.json           ← Cấu hình ứng dụng Expo
├── package.json       ← Danh sách thư viện & scripts
└── tsconfig.json      ← Cấu hình TypeScript
```

---

## 📂 Chi Tiết Từng Thư Mục

---

### 📂 `app/` — Màn hình & Routing

**Tác dụng:** Chứa toàn bộ màn hình của ứng dụng. Sử dụng cơ chế **file-based routing** của `expo-router` — mỗi file tương ứng với 1 màn hình/route.

> **Quy tắc đặt tên:**
> - Tên thư mục trong ngoặc `(auth)`, `(tabs)` → **nhóm route** (không ảnh hưởng URL)
> - Tên file trong ngoặc vuông `[id].tsx` → **dynamic route** (truyền tham số động)
> - `_layout.tsx` → **layout bao bọc** các màn hình trong cùng nhóm

```
app/
├── _layout.tsx              ← Layout gốc: khởi tạo font, splash screen, kiểm tra đăng nhập
│
├── (auth)/                  ← Nhóm màn hình xác thực (chưa đăng nhập)
│   ├── _layout.tsx          ← Layout cho nhóm auth
│   ├── login.tsx            ← Màn hình đăng nhập
│   └── register.tsx         ← Màn hình đăng ký tài khoản
│
├── (tabs)/                  ← Nhóm màn hình chính (đã đăng nhập, có thanh tab dưới)
│   ├── _layout.tsx          ← Cấu hình thanh Tab: icon, tên, màu sắc
│   ├── index.tsx            ← Tab "Trang chủ" — danh sách quỹ của người dùng
│   ├── notifications.tsx    ← Tab "Thông báo" — lịch sử thông báo
│   └── profile.tsx          ← Tab "Hồ sơ" — thông tin & cài đặt tài khoản
│
├── fund/                    ← Màn hình liên quan đến quỹ
│   ├── [id].tsx             ← Chi tiết 1 quỹ (nhận id quỹ qua URL)
│   ├── create.tsx           ← Tạo quỹ mới
│   └── join.tsx             ← Tham gia quỹ bằng mã mời
│
└── transaction/             ← Màn hình giao dịch
    ├── contribute.tsx       ← Nạp tiền vào quỹ
    └── withdraw.tsx         ← Rút tiền khỏi quỹ
```

**Khi nào chỉnh sửa:**
- Thêm màn hình mới → tạo file `.tsx` mới trong đây
- Thay đổi tab bar → sửa `(tabs)/_layout.tsx`
- Thay đổi điều hướng toàn app → sửa `_layout.tsx`

---

### 📂 `assets/` — Tài Nguyên Tĩnh

**Tác dụng:** Lưu trữ các file tài nguyên tĩnh như hình ảnh, icon, và font chữ.

```
assets/
└── images/        ← Hình ảnh: logo app, splash screen, icon, ảnh minh họa...
```

**Khi nào chỉnh sửa:**
- Thêm ảnh mới → đặt vào `assets/images/`
- Đổi icon/splash → thay file và cập nhật `app.json`

---

### 📂 `components/` — Giao Diện Tái Sử Dụng

**Tác dụng:** Chứa các component UI được dùng ở nhiều màn hình khác nhau. Chia thành 2 nhóm:

```
components/
│
├── common/                      ← Component cấp cao, dùng xuyên suốt app
│   ├── EmptyState.tsx           ← Hiển thị khi danh sách trống
│   │                               (VD: "Bạn chưa có quỹ nào")
│   ├── Header.tsx               ← Thanh tiêu đề màn hình tùy chỉnh
│   └── Loading.tsx              ← Màn hình/spinner loading khi đang tải dữ liệu
│
└── ui/                          ← Component nguyên tử (atomic) — nhỏ nhất, đơn giản nhất
    ├── Badge.tsx                ← Nhãn tag nhỏ (VD: "Hoạt động", "Đã đóng", "Admin")
    ├── Button.tsx               ← Nút bấm với style nhất quán toàn app
    ├── Card.tsx                 ← Thẻ khung nền để bọc nội dung
    ├── Input.tsx                ← Ô nhập liệu có style và validation
    └── TransactionItem.tsx      ← Hiển thị 1 dòng giao dịch trong danh sách
```

**Khi nào chỉnh sửa:**
- Thêm component dùng nhiều nơi → tạo file mới trong `components/`
- Sửa giao diện nút bấm → sửa `ui/Button.tsx`
- Sửa giao diện loading → sửa `common/Loading.tsx`

---

### 📂 `constants/` — Hằng Số & Theme

**Tác dụng:** Lưu các giá trị cố định không đổi trong suốt vòng đời app.

```
constants/
└── theme.ts        ← Bảng màu sắc, kích thước font, spacing, border radius...
```

**Ví dụ nội dung `theme.ts`:**
```typescript
export const Colors = {
  primary: '#FF6B6B',
  background: '#FFFFFF',
  text: '#333333',
  ...
}
```

**Khi nào chỉnh sửa:**
- Đổi màu chủ đạo của app → sửa `theme.ts`
- Thêm hằng số dùng nhiều nơi → thêm vào đây

---

### 📂 `hooks/` — Custom React Hooks

**Tác dụng:** Đóng gói logic phức tạp thành các hook tái sử dụng, giúp code ở màn hình gọn gàng hơn.

```
hooks/
├── useAuth.ts              ← Quản lý trạng thái người dùng:
│                               đăng nhập, đăng xuất, thông tin user hiện tại
├── useFund.ts              ← Lấy và quản lý dữ liệu quỹ của người dùng
├── useNotifications.ts     ← Đăng ký nhận push notification,
│                               xử lý khi nhận thông báo
└── useRealtime.ts          ← Lắng nghe dữ liệu thay đổi realtime từ Firestore
```

**Cách dùng trong màn hình:**
```typescript
// Thay vì viết logic dài dòng trong màn hình:
const { user, signIn, signOut } = useAuth();
const { funds, loading } = useFund();
```

**Khi nào chỉnh sửa:**
- Thêm logic dùng nhiều màn hình → tạo hook mới
- Thay đổi cách lấy dữ liệu quỹ → sửa `useFund.ts`

---

### 📂 `lib/` — Khởi Tạo Thư Viện Bên Ngoài

**Tác dụng:** Cấu hình và khởi tạo các SDK/thư viện bên ngoài (chủ yếu là Firebase). Tách biệt khỏi business logic để dễ bảo trì.

```
lib/
├── firebase.ts         ← Khởi tạo Firebase SDK cho mobile (Android & iOS)
├── firebase.web.ts     ← Khởi tạo Firebase SDK riêng cho Web
│                           (Expo tự chọn file phù hợp theo platform)
├── auth.ts             ← Các hàm xác thực:
│                           signIn(), signUp(), signOut(), getCurrentUser()
└── firestore.ts        ← Các hàm thao tác Firestore:
                            getDoc(), setDoc(), updateDoc(), deleteDoc()...
```

> **Lý do có `firebase.ts` và `firebase.web.ts`:**  
> Firebase có API hơi khác nhau giữa mobile và web. Expo tự động chọn file `.web.ts` khi chạy trên trình duyệt.

**Khi nào chỉnh sửa:**
- Thêm Firebase service mới (Storage, Analytics...) → cập nhật `firebase.ts`
- Thêm hàm database mới → thêm vào `firestore.ts`

---

### 📂 `services/` — Logic Nghiệp Vụ (Business Logic)

**Tác dụng:** Tầng trung gian xử lý các nghiệp vụ phức tạp. Gọi xuống `lib/` để thao tác database, đồng thời xử lý logic trước khi trả kết quả lên `hooks/`.

```
services/
├── fundService.ts              ← Nghiệp vụ quản lý quỹ:
│                                   tạo quỹ, sửa quỹ, xóa quỹ,
│                                   lấy danh sách quỹ của user
├── memberService.ts            ← Nghiệp vụ quản lý thành viên:
│                                   thêm thành viên, xóa thành viên,
│                                   phân quyền admin/member
├── notificationService.ts      ← Gửi thông báo tự động:
│                                   khi có giao dịch mới, khi được thêm vào quỹ
└── transactionService.ts       ← Nghiệp vụ giao dịch:
                                    nạp tiền, rút tiền, lịch sử giao dịch,
                                    tính toán số dư quỹ
```

**Khi nào chỉnh sửa:**
- Thêm tính năng mới liên quan đến quỹ → sửa `fundService.ts`
- Thêm loại giao dịch mới → sửa `transactionService.ts`
- Thay đổi quy tắc thành viên → sửa `memberService.ts`

---

### 📂 `types/` — Kiểu Dữ Liệu TypeScript

**Tác dụng:** Định nghĩa cấu trúc (interface/type) của các đối tượng dữ liệu dùng trong toàn project. Giúp TypeScript kiểm tra lỗi tự động và code dễ đọc hơn.

```
types/
└── index.ts        ← Tất cả interface/type của project
```

**Ví dụ nội dung:**
```typescript
export interface Fund {
  id: string;
  name: string;
  balance: number;
  members: string[];
  createdAt: Date;
}

export interface Transaction {
  id: string;
  fundId: string;
  userId: string;
  amount: number;
  type: 'contribute' | 'withdraw';
  createdAt: Date;
}
```

**Khi nào chỉnh sửa:**
- Thêm trường mới vào Firestore → cập nhật interface tương ứng
- Tạo đối tượng dữ liệu mới → thêm interface mới vào đây

---

### 📂 `utils/` — Hàm Tiện Ích

**Tác dụng:** Các hàm nhỏ, thuần túy (pure function), không phụ thuộc React, dùng nhiều nơi trong app.

```
utils/
└── helpers.ts      ← Các hàm tiện ích:
                        - Format tiền tệ (VD: 1000000 → "1.000.000 đ")
                        - Format ngày giờ (VD: "21/05/2026 22:00")
                        - Tính số dư quỹ
                        - Tạo mã mời ngẫu nhiên
                        - Các hàm xử lý string/number...
```

**Khi nào chỉnh sửa:**
- Thêm hàm format/xử lý dùng nhiều nơi → thêm vào `helpers.ts`

---

## 🔄 Luồng Dữ Liệu

```
📱 Màn hình (app/)
      │
      ├── dùng ──► 🎨 Components (components/)   — hiển thị giao diện
      │
      ├── dùng ──► 🪝 Hooks (hooks/)              — quản lý state & logic
      │                   │
      │                   └── gọi ──► ⚙️ Services (services/)   — xử lý nghiệp vụ
      │                                     │
      │                                     └── gọi ──► 🔥 Lib (lib/)   — gọi Firebase
      │                                                       │
      │                                                       └──► ☁️ Firestore Database
      │
      ├── dùng ──► 🎨 Constants (constants/)      — màu sắc, theme
      ├── dùng ──► 🛠️ Utils (utils/)              — format dữ liệu
      └── dùng ──► 📐 Types (types/)              — kiểu dữ liệu
```

---

## 📋 Quy Tắc Khi Thêm Code Mới

| Tôi muốn... | Tôi nên thêm vào... |
|-------------|---------------------|
| Thêm màn hình mới | `app/` |
| Thêm component UI dùng lại | `components/ui/` hoặc `components/common/` |
| Thêm logic lấy dữ liệu | `hooks/` |
| Thêm hàm gọi API/database | `services/` |
| Thêm cấu hình Firebase | `lib/` |
| Thêm kiểu dữ liệu mới | `types/index.ts` |
| Thêm hàm format/xử lý | `utils/helpers.ts` |
| Thêm màu sắc/font | `constants/theme.ts` |
| Thêm ảnh/icon | `assets/images/` |

---

## 🚀 Chạy Ứng Dụng

```bash
# Cài đặt thư viện
npm install

# Chạy trên trình duyệt web
npm run web

# Chạy trên Android
npm run android

# Chạy trên iOS
npm run ios

# Chạy Expo DevTools
npm start
```

---

*Tài liệu này được tạo để hỗ trợ team phát triển hiểu rõ cấu trúc project MomoFund.*
