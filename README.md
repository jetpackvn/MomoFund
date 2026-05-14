# TÀI LIỆU TỔNG QUAN DỰ ÁN

# 1. Giới thiệu dự án

## 1.1 Tên đề tài

# **MomoFund – Ứng dụng quản lý quỹ nhóm trên nền tảng di động**

> **Lưu ý dành cho Developer:** Vui lòng đọc kỹ [Hướng dẫn Phát triển & Chuẩn Coding (DEVELOPMENT_GUIDELINES.md)](./DEVELOPMENT_GUIDELINES.md) trước khi bắt đầu code để đảm bảo sự đồng bộ trong toàn bộ dự án.

---

## 1.2 Mô tả đề tài

MomoFund là ứng dụng mobile hỗ trợ người dùng:

- tạo quỹ chung,
- quản lý thành viên,
- theo dõi đóng góp,
- quản lý giao dịch quỹ theo thời gian thực.

Hệ thống được lấy cảm hứng từ tính năng **Quỹ Nhóm** của [MoMo](https://www.momo.vn/?utm_source=chatgpt.com), tuy nhiên không chỉ dừng ở việc mô phỏng lại chức năng mà còn hướng đến:

- phân tích các vấn đề thực tế trong mô hình quản lý quỹ hiện tại,
- đề xuất hướng cải tiến phù hợp hơn cho người dùng nhóm.

---

# 2. Mục tiêu dự án

## 2.1 Mục tiêu chính

Xây dựng ứng dụng quản lý quỹ nhóm:

- đơn giản,
- minh bạch,
- realtime,
- hỗ trợ nhiều người dùng cùng lúc.

---

## 2.2 Mục tiêu học thuật

Thông qua quá trình phân tích hệ thống:

- tìm hiểu mô hình collaborative finance,
- áp dụng phân tích yêu cầu phần mềm,
- thiết kế hệ thống mobile realtime,
- xây dựng workflow đa người dùng.

---

# 3. Ý tưởng cốt lõi của hệ thống

Ứng dụng cho phép:

- một người tạo quỹ,
- nhiều thành viên tham gia,
- các thành viên cùng đóng góp tiền vào quỹ chung,
- theo dõi lịch sử hoạt động minh bạch.

Ví dụ:

- quỹ du lịch,
- quỹ lớp học,
- quỹ nhóm làm đồ án,
- quỹ sinh hoạt chung.

---

# 4. Phạm vi hệ thống (Scope)

## 4.1 Chức năng nằm trong phạm vi

### Authentication

- Đăng ký
- Đăng nhập
- Đăng xuất

---

### Fund Management

- Tạo quỹ
- Xem danh sách quỹ
- Chỉnh sửa thông tin quỹ
- Giải tán quỹ

---

### Membership

- Tham gia quỹ bằng mã/code
- Xem danh sách thành viên
- Rời quỹ

---

### Contribution & Transaction

- Đóng góp tiền vào quỹ
- Theo dõi lịch sử giao dịch
- Xem số dư quỹ

---

### Withdrawal

- Tạo yêu cầu rút tiền
- Chủ quỹ duyệt yêu cầu

---

### Notification

- Thông báo hoạt động mới
- Cập nhật realtime

---

# 4.2 Ngoài phạm vi

Dự án KHÔNG hướng tới:

- ví điện tử hoàn chỉnh,
- thanh toán ngân hàng thật,
- chuyển khoản thật,
- KYC/CCCD,
- blockchain,
- crypto,
- hệ thống tài chính production.

Ứng dụng chỉ mô phỏng workflow quản lý quỹ nhóm.

---

# 5. Người dùng hệ thống

## 5.1 User

Người sử dụng ứng dụng.

User có thể:

- tạo quỹ,
- tham gia quỹ,
- đóng góp tiền,
- theo dõi giao dịch.

---

## 5.2 Admin

Quản trị hệ thống.

Admin có thể:

- quản lý user,
- quản lý quỹ,
- xử lý báo cáo hệ thống.

---

# 6. Vai trò trong quỹ

Trong mỗi quỹ:

- người tạo quỹ sẽ là chủ quỹ,
- các người dùng khác là thành viên.

Đây là role nghiệp vụ trong quỹ, không phải actor riêng của hệ thống.

---

# 7. Điểm trọng tâm của dự án

Dự án tập trung vào: “quản lý quỹ cộng tác theo thời gian thực”

Các thành viên:

- có thể thao tác cùng lúc,
- theo dõi số dư realtime,
- cập nhật giao dịch tức thời.

Đây là phần cốt lõi của hệ thống.

---

# 8. Các vấn đề thực tế nhóm muốn nghiên cứu

Ngoài việc xây dựng ứng dụng, nhóm sẽ phân tích thêm một số vấn đề đang tồn tại trong mô hình quỹ nhóm hiện nay.

---

## 8.1 Vấn đề đóng quỹ và hoàn tiền

### Hiện trạng

Trong mô hình hiện tại:

- khi quỹ kết thúc,
- chủ quỹ phải tự rút tiền còn lại,
- sau đó hoàn tiền thủ công cho các thành viên.

Điều này dẫn tới:

- phụ thuộc vào chủ quỹ,
- thiếu minh bạch,
- khó kiểm tra việc phân chia.

---

## Hướng nghiên cứu

Nhóm sẽ:

- phân tích workflow đóng quỹ,
- thảo luận cơ chế xử lý số dư còn lại,
- đề xuất hướng cải tiến phù hợp hơn.

Đây là phần: “research/problem-solving”

không bắt buộc phải implement hoàn chỉnh.

---

## 8.2 Vấn đề ủy quyền quản lý quỹ

### Hiện trạng

Một quỹ thường chỉ phụ thuộc vào một chủ quỹ:

- nếu chủ quỹ không hoạt động,
- việc quản lý sẽ bị gián đoạn.

---

## Hướng nghiên cứu

Nhóm sẽ:

- phân tích nhu cầu ủy quyền,
- tìm hiểu cơ chế phân quyền phù hợp,
- đề xuất cách tổ chức quản lý quỹ linh hoạt hơn.

Đây là:

- hướng phân tích mở rộng,
- không phải trọng tâm implementation chính.

---

# 9. Công nghệ sử dụng

## Frontend

- React Native
- Expo Go

---

## Backend & Database

- Firebase Firestore

---

## Authentication

- Firebase Authentication

---

## Realtime

- Firestore Realtime Listener

---

# 10. Kiến trúc hệ thống

```
Mobile App
    ↓
Firebase Authentication
    ↓
Cloud Firestore
```

---

# 11. Các module chính

## 1. Authentication Module

Quản lý đăng nhập/đăng ký.

---

## 2. Fund Module

Quản lý quỹ nhóm.

---

## 3. Membership Module

Quản lý thành viên quỹ.

---

## 4. Transaction Module

Quản lý đóng góp và giao dịch.

---

## 5. Notification Module

Thông báo realtime.

---

# 12. Định hướng database sơ bộ

Hệ thống dự kiến gồm các collection/table chính:

```
users
funds
fund_members
transactions
withdraw_requests
notifications
activity_logs
```

---

# 13. Mục tiêu demo cuối kỳ

Ứng dụng cần demo được:

### Scenario

1. User A tạo quỹ
2. User B tham gia bằng mã
3. User B đóng góp tiền
4. User A thấy số dư cập nhật realtime
5. Thành viên xem lịch sử giao dịch
6. Chủ quỹ duyệt yêu cầu rút tiền

---

# 14. Định hướng phân tích hệ thống

Trong quá trình làm đồ án, nhóm cần:

- phân tích actor/use case,
- xây dựng ERD,
- thiết kế workflow,
- phân tích quyền trong quỹ,
- xây dựng sequence diagram cho các nghiệp vụ chính.

---

# 15. Những phần cả nhóm cần cùng thảo luận

Đây là các phần chưa “chốt giải pháp”, cần brainstorm thêm:

---

## 1. Workflow đóng quỹ

- Khi quỹ còn dư tiền thì xử lý thế nào?
- Hoàn tiền dựa trên tiêu chí gì?
- Có cần voting/xác nhận không?

---

## 2. Cơ chế ủy quyền

- Có nên cho phép chuyển quyền chủ quỹ?
- Khi chủ quỹ rời quỹ thì xử lý sao?
- Cần bao nhiêu mức quyền?

---

## 3. Workflow rút tiền

- Thành viên có được tạo yêu cầu rút không?
- Chủ quỹ duyệt theo cách nào?
- Có giới hạn giao dịch không?

---

# 16. Kết luận định hướng dự án

MomoFund không chỉ là ứng dụng mô phỏng Quỹ Nhóm của MoMo mà còn hướng tới:

- phân tích bài toán quản lý quỹ cộng tác,
- nghiên cứu các vấn đề thực tế trong vận hành quỹ nhóm,
- xây dựng hệ thống realtime nhiều người dùng,
- đề xuất hướng cải tiến cho workflow quản lý quỹ.
