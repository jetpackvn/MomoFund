# Hướng dẫn Phát triển & Chuẩn Coding (Development Guidelines)

Tài liệu này quy định các chuẩn mực chung khi viết code cho dự án **MomoFund**. Mọi thành viên tham gia phát triển dự án cần đọc kỹ và tuân thủ các quy tắc dưới đây để đảm bảo source code luôn đồng bộ, dễ bảo trì và dễ mở rộng.

---

## 1. Cấu trúc thư mục (Project Structure)

Dự án tuân theo kiến trúc phân tách rõ ràng giữa UI và Logic (Backend Services):

- `app/`: Chứa toàn bộ giao diện (UI Screens) sử dụng **Expo Router**. Mỗi file ở đây đại diện cho một màn hình hoặc layout.
- `components/`: Chứa các UI Components dùng chung (ví dụ: Button, Card, Header, Modal) không phụ thuộc vào màn hình cụ thể.
- `services/`: Chứa logic thao tác với Backend/Firestore (CRUD data). **Tuyệt đối không viết logic query Firestore trực tiếp trong UI**.
- `hooks/`: Chứa các Custom React Hooks (như `useAuth`, `useFund`) để quản lý state và lắng nghe dữ liệu realtime từ Firebase.
- `lib/`: Chứa các file cấu hình hệ thống (ví dụ: `firebase.ts`, `firestore.ts`).
- `types/`: Nơi định nghĩa toàn bộ **TypeScript Interfaces** dùng chung cho cả dự án.
- `constants/`: Chứa các hằng số hệ thống, đặc biệt là `theme.ts` (màu sắc, kích thước, font size).

---

## 2. Quy tắc lập trình giao diện (UI & Styling)

### 2.1. Sử dụng Theme hệ thống
- Tuyệt đối không hardcode mã màu hex (ví dụ: `#FF0000`) hay kích thước trực tiếp trong file UI.
- Phải import và sử dụng từ `constants/theme`:
  ```tsx
  import { colors, spacing, radius, fontSize } from '@/constants/theme';
  // Ví dụ: backgroundColor: colors.primary, padding: spacing.md
  ```

### 2.2. Nhập liệu và Form
- Bất kỳ màn hình nào có `TextInput` đều phải được bọc trong `<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>` để tránh việc bàn phím che mất input trên điện thoại thật.
- Các nút bấm quan trọng (Submit, Save) cần có trạng thái `loading` và `disabled` để tránh bấm 2 lần.

---

## 3. Quy tắc làm việc với Firebase & Database

### 3.1. Truy xuất dữ liệu (Services)
- Mọi thao tác Thêm, Sửa, Xóa (CRUD) dữ liệu trên Firestore phải được viết thành các phương thức bên trong thư mục `services/` (ví dụ: `fundService.ts`, `transactionService.ts`).
- **Không bao giờ** import `setDoc`, `updateDoc` hay thao tác Database trực tiếp ở file giao diện (`app/`). Giao diện chỉ gọi hàm từ Service.

### 3.2. Import Firestore Utils
- Luôn luôn import các collection name và hàm helper từ `lib/firestore` thay vì import trực tiếp từ thư viện `firebase/firestore`. Việc này giúp đồng bộ tên bảng và tránh gõ sai:
  ```typescript
  // Đúng:
  import { collection, doc, COLLECTIONS, db } from '@/lib/firestore';
  
  // Sai:
  import { collection } from 'firebase/firestore'; 
  ```

### 3.3. Xử lý Realtime (Dữ liệu thời gian thực)
- Đối với các dữ liệu cần cập nhật ngay lập tức khi có thay đổi (như Số dư quỹ, Danh sách giao dịch mới), hãy tạo và sử dụng **Custom Hook** với `onSnapshot` trong thư mục `hooks/` (ví dụ: `useFund.ts`).
- Hook sẽ chịu trách nhiệm quản lý state `data`, `loading`, và `error` để cung cấp cho UI.

---

## 4. Quy tắc TypeScript

- **Tuyệt đối không dùng type `any`** trừ những trường hợp bất khả kháng liên quan đến thư viện ngoài.
- Khi làm việc với dữ liệu trả về từ Firestore, luôn định nghĩa Interface chuẩn trong `types/index.ts` và ép kiểu (cast type) khi nhận dữ liệu:
  ```typescript
  const data = docSnap.data() as Fund;
  ```
- Nếu một property có thể không tồn tại, hãy dùng dấu hỏi chấm `?` (optional) trong Interface.

---

## 5. Quy trình thêm tính năng mới (Workflow)

Khi bạn được giao làm một tính năng mới (Ví dụ: Chức năng Rút tiền), hãy làm theo thứ tự sau:
1. **Types**: Định nghĩa interface `WithdrawRequest` trong `types/index.ts`.
2. **Database Config**: Thêm tên bảng `WITHDRAW_REQUESTS` vào biến `COLLECTIONS` trong `lib/firestore.ts`.
3. **Services**: Tạo file `services/withdrawService.ts` chứa các hàm (Tạo yêu cầu rút, Duyệt yêu cầu).
4. **Hooks** (nếu cần realtime): Tạo `hooks/useWithdrawRequests.ts` để lấy danh sách yêu cầu.
5. **UI**: Cuối cùng mới tạo các file màn hình trong `app/` để vẽ giao diện và gọi các service/hooks ở trên.

---

Tuân thủ các quy tắc này giúp mọi người trong team có thể đọc code của nhau dễ dàng hơn, giảm thiểu bug khi merge code và duy trì kiến trúc dự án sạch sẽ!
