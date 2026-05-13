# ĐIỀU LỆ DỰ ÁN (PROJECT CHARTER)
## MomoFund – Ứng dụng Quản lý Quỹ Nhóm

---

**Tên dự án (Project Title):** MomoFund – Ứng dụng quản lý quỹ nhóm trên nền tảng di động

**Ngày bắt đầu (Project Start Date):** 18/02/2025 — **Ngày kết thúc (Projected Finish Date):** 13/06/2025

**Scrum Master:** Lê Thành Hiệu

**Product Owner:** Trần Hoàng Huy

---

**Mục tiêu dự án (Project Objectives):**
Xây dựng ứng dụng mobile cho phép nhiều người dùng cùng tạo và quản lý quỹ chung theo thời gian thực. Hệ thống hỗ trợ đóng góp tiền, theo dõi số dư, quản lý giao dịch và duyệt yêu cầu rút tiền — hướng tới mô hình quản lý quỹ cộng tác minh bạch, đơn giản và realtime.

---

**Lý do thực hiện (Business Case):**
Mô hình quỹ nhóm hiện tại (quỹ lớp, quỹ du lịch, quỹ đồ án...) thường được quản lý thủ công qua nhắn tin hoặc Excel, dẫn đến thiếu minh bạch và phụ thuộc hoàn toàn vào một người. Tính năng Quỹ Nhóm của MoMo đã giải quyết được một phần, nhưng vẫn tồn tại các vấn đề chưa được xử lý tốt như: workflow đóng quỹ và hoàn tiền, cơ chế ủy quyền khi chủ quỹ vắng mặt, và giới hạn trong quy trình duyệt rút tiền. MomoFund hướng tới phân tích và đề xuất cải tiến cho những vấn đề thực tế này.

---

**Cách tiếp cận (Approach):**
- Áp dụng mô hình Agile/Scrum với tối thiểu 3 Sprints, mỗi Sprint 2 tuần
- Sử dụng React Native + Expo Go cho Mobile App; Firebase Firestore + Authentication cho Backend
- Sử dụng Notion làm công cụ quản lý dự án (Backlog, Kanban, Meeting Log)
- Sử dụng GitHub để quản lý mã nguồn, Code Review qua Pull Request
- Ưu tiên hoàn thiện tính năng cốt lõi (Auth, Fund Management, Transaction) trước khi nghiên cứu các vấn đề mở rộng

---

**Các cột mốc quan trọng (Milestones):**

| Cột mốc | Mô tả | Thời hạn |
|---|---|---|
| M0 — Khởi động | Hoàn thành tài liệu kế hoạch, setup Notion + GitHub + Firebase | 24/02/2025 |
| M1 — Sprint 1 | Auth (đăng ký, đăng nhập) + Fund Management (tạo, xem, chỉnh sửa quỹ) | 07/03/2025 |
| M2 — Sprint 2 | Membership (tham gia/rời quỹ) + Transaction (đóng góp, lịch sử giao dịch) | 21/03/2025 |
| M3 — Sprint 3 | Withdrawal (yêu cầu rút tiền, duyệt) + Notification realtime + Deploy | 04/04/2025 |
| M4 — Nộp bài | Hoàn thiện báo cáo, chuẩn bị thuyết trình | 13/06/2025 |

---

**Vai trò và Trách nhiệm (Roles and Responsibilities):**

| Tên | Vai trò | Trách nhiệm |
|---|---|---|
| Trần Hoàng Huy | Product Owner | Quản lý Product Backlog, xác định ưu tiên tính năng, viết tài liệu |
| Lê Thành Hiệu | Scrum Master | Điều phối Scrum, duy trì Notion + GitHub, ghi biên bản họp |
| Nguyễn Phước An | Developer | Thiết kế Firestore schema, lập trình Backend logic, realtime listener |
| Nguyễn Thành Công | Developer / QA | Lập trình UI React Native, thiết kế giao diện, kiểm thử |

---

**Ký tên (Sign-off):**

| Tên | Vai trò | Chữ ký |
|---|---|---|
| Trần Hoàng Huy | Product Owner | |
| Lê Thành Hiệu | Scrum Master | |
| Nguyễn Phước An | Developer | |
| Nguyễn Thành Công | Developer | |

---

**Chú thích (Comments):**

> *"Ứng dụng cần demo được đầy đủ scenario cốt lõi: tạo quỹ → tham gia → đóng góp → xem số dư realtime → duyệt rút tiền. Các phần nghiên cứu mở rộng (workflow đóng quỹ, ủy quyền) là phần cộng thêm, không bắt buộc implement hoàn chỉnh."* — Trần Hoàng Huy, Product Owner
