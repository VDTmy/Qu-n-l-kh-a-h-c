# EDUMASTER V2 - PROMPT THIẾT KẾ LẠI UI THEO BACKEND FASTAPI

Hãy thiết kế lại từ đầu toàn bộ giao diện website học trực tuyến **EduMaster** theo hướng **Backend First Design**.

Mục tiêu quan trọng nhất:

* Giao diện phải khớp với backend FastAPI hiện tại.
* Không tạo chức năng nếu backend chưa có API.
* Không tạo button giả.
* Không tạo route thừa.
* Không dùng mock data làm logic chính.
* Mỗi màn hình phải có API mapping rõ ràng.
* Sau khi thiết kế xong có thể code React kết nối backend ngay.

---

# 1. TỔNG QUAN HỆ THỐNG

EduMaster là hệ thống LMS học trực tuyến gồm 3 vai trò:

1. Học sinh
2. Giảng viên
3. Admin

Luồng nghiệp vụ chính:

```text
Học sinh đăng ký / đăng nhập
Giảng viên đăng ký + tạo hồ sơ + upload CV
Admin duyệt giảng viên
Giảng viên tạo khóa học
Admin duyệt khóa học
Khóa học được hiển thị public
Học sinh đăng ký khóa học
Học sinh học bài giảng
Học sinh làm bài kiểm tra
Hệ thống lưu điểm và tiến độ
Giảng viên xem học sinh/kết quả
Admin quản trị tin tức, liên hệ, bình luận
```

---

# 2. PHONG CÁCH UI

Thiết kế theo phong cách:

* Hiện đại
* Chuyên nghiệp
* Sạch sẽ
* Dễ dùng
* Giống nền tảng giáo dục Việt Nam như HOCMAI nhưng không sao chép
* Phù hợp học sinh THCS, THPT, luyện thi đại học
* Dễ code bằng React

Màu sắc:

* Primary: xanh dương đậm
* Accent: cam
* Background: trắng / xám nhạt
* Text: đen / xám đậm
* Success: xanh lá
* Warning: vàng/cam
* Danger: đỏ

Typography:

* Be Vietnam Pro hoặc Inter
* Dễ đọc
* Không dùng font quá nghệ thuật

Component style:

* Card bo góc 12px–16px
* Shadow nhẹ
* Button rõ ràng
* Table dễ đọc
* Modal gọn
* Form rõ label
* Dashboard tối giản, ưu tiên dữ liệu

Không dùng:

* Dark luxury toàn bộ
* 3D nặng
* Particle
* Fog/smoke
* Animation quá nhiều
* Nút không có chức năng

---

# 3. BACKEND API PHẢI BÁM THEO

## Auth

```text
POST /auth/register
POST /auth/login
GET /auth/me
```

Login trả về:

```text
access_token
token_type
role
```

Quy tắc:

* Không cho người dùng chọn role khi login production.
* Role lấy từ backend sau khi đăng nhập.
* Login gửi dạng OAuth2PasswordRequestForm.
* Header API có token: Authorization: Bearer <access_token>.

---

## Teacher

```text
POST /teachers/profile
POST /teachers/profile/upload-cv
GET /teachers/me/courses
GET /teachers/me/courses/{course_id}/students
GET /teachers/me/exams
GET /teachers/me/statistics
```

Quy tắc:

* Giảng viên đăng ký xong phải tạo hồ sơ và upload CV.
* Hồ sơ giảng viên ban đầu là pending.
* Giảng viên chỉ vào dashboard khi admin duyệt.

---

## Admin

```text
GET /admin/teachers/pending
PATCH /admin/teachers/{teacher_profile_id}/approve
PATCH /admin/teachers/{teacher_profile_id}/reject

GET /admin/courses/pending
PATCH /admin/courses/{course_id}/approve
PATCH /admin/courses/{course_id}/reject

GET /admin/comments
PATCH /admin/comments/{comment_id}/pin
PATCH /admin/comments/{comment_id}/unpin

GET /admin/dashboard/statistics
```

---

## Courses

```text
POST /courses/
GET /courses/
GET /courses/{course_id}
GET /courses/exam-prep/list
POST /courses/{course_id}/thumbnail
```

Course fields:

```text
id
title
short_description
full_description
price
thumbnail_url
level
status
teacher_id
subject_id
grade_id
course_type_id
rejection_reason
```

Quy tắc:

* Khóa học mới tạo có status = pending.
* Public chỉ hiển thị khóa học approved.
* Admin duyệt khóa học thì mới hiện public.

---

## Course Types

```text
GET /course-types
POST /course-types
```

CourseType fields:

```text
id
name
requires_grade
```

Logic quan trọng:

```text
requires_grade = true  → cần chọn lớp
requires_grade = false → không chọn lớp
```

---

## Common Data

```text
GET /common/subjects
POST /common/subjects

GET /common/grades
POST /common/grades
```

Frontend phải lấy môn học/lớp từ API, không hard-code nếu có API.

---

## Lessons

```text
POST /lessons/sections
POST /lessons/
GET /lessons/course/{course_id}
POST /lessons/upload-video/{lesson_id}
POST /lessons/upload-document/{lesson_id}
```

Quy tắc cực quan trọng:

* Form thêm bài giảng video phải có upload video.
* Form thêm tài liệu phải có upload document.
* Không được tạo màn quản lý bài giảng mà thiếu upload video.

---

## Enrollments

```text
POST /enrollments/courses/{course_id}
GET /enrollments/me
GET /enrollments/courses/{course_id}/status
```

---

## Progress

```text
PATCH /progress/lessons/{lesson_id}
GET /progress/courses/{course_id}
```

---

## Exams

```text
POST /exams/
POST /exams/questions
POST /exams/answers
GET /exams/course/{course_id}
GET /exams/{exam_id}/detail
POST /exams/{exam_id}/submit
GET /exams/my-attempts
GET /exams/attempts/{attempt_id}/result
```

---

## Students

```text
GET /students/me/courses
GET /students/me/scores
GET /students/me/statistics
```

---

## Comments

```text
POST /comments/
GET /comments/course/{course_id}
```

---

## News

```text
POST /news/
GET /news/
GET /news/{news_id}
PATCH /news/{news_id}
PATCH /news/{news_id}/hide
```

---

## Contacts

```text
POST /contacts/
GET /contacts/
PATCH /contacts/{contact_id}/process
```

Contact fields:

```text
id
full_name
email
phone
message
status
```

Không dùng:

```text
is_processed
created_at
```

nếu backend không trả.

---

## Notifications

```text
GET /notifications/me
GET /notifications/me/unread-count
PATCH /notifications/{notification_id}/read
```

---

## Certificates

```text
POST /certificates/courses/{course_id}/generate
GET /certificates/me
```

---

# 4. ROUTE TREE CHUẨN

## Public routes

```text
/
 /courses
 /courses/:id
 /exam-prep
 /instructors
 /instructors/:id
 /news
 /news/:id
 /contact
 /login
 /register
```

---

## Student routes

```text
/student/dashboard
/student/courses
/student/scores
/student/progress
/student/lecturers
/student/certificates
/student/profile
/student/notifications

/learn/:courseId/:lessonId
/exam/:id
/exam/:id/result
```

---

## Teacher routes

```text
/lecturer/dashboard
/lecturer/profile
/lecturer/courses
/lecturer/courses/new
/lecturer/courses/:id/edit
/lecturer/lessons
/lecturer/documents
/lecturer/exams
/lecturer/students
/lecturer/results
/lecturer/comments
```

---

## Admin routes

```text
/admin/dashboard
/admin/teacher-approval
/admin/course-approval
/admin/news
/admin/contacts
/admin/comments
/admin/subjects
/admin/course-types
/admin/profile
```

Không tạo route:

```text
/admin/fake-management
/design-system
/mock-dashboard
```

---

# 5. AUTH FLOW

## Login

Form gồm:

* Email
* Mật khẩu
* Đăng nhập
* Quên mật khẩu nếu muốn demo
* Link đăng ký

Không có dropdown chọn role trong production.

Logic:

```text
POST /auth/login
→ lưu access_token
→ GET /auth/me
→ lấy role
→ điều hướng
```

Điều hướng:

```text
student → /
teacher → kiểm tra trạng thái hồ sơ
admin → /admin/dashboard
```

Nếu teacher chưa approved:

```text
pending → màn "Hồ sơ đang chờ duyệt"
rejected → màn "Hồ sơ bị từ chối"
null → màn "Hoàn thiện hồ sơ giảng viên"
approved → /lecturer/dashboard
```

---

## Register

Trang đăng ký có 2 tab:

```text
Đăng ký học sinh
Đăng ký giảng viên
```

### Đăng ký học sinh

Fields:

* Họ tên
* Email
* Mật khẩu
* Xác nhận mật khẩu

Gọi:

```text
POST /auth/register
role = student
```

Sau đăng ký thành công:

```text
Chuyển đến /login
```

---

### Đăng ký giảng viên

Form gồm:

* Họ tên
* Email
* Mật khẩu
* Xác nhận mật khẩu
* Số điện thoại
* Chuyên môn
* Kinh nghiệm
* Giới thiệu bản thân
* Upload CV

Flow đúng:

```text
POST /auth/register role=teacher
→ tự động login bằng tài khoản vừa đăng ký
→ lưu token tạm
→ POST /teachers/profile
→ POST /teachers/profile/upload-cv
→ logout
→ hiển thị trang chờ duyệt
```

Không được gọi `POST /teachers/profile` khi chưa có token.

---

# 6. PROTECTED ROUTES

## StudentGuard

Áp dụng cho:

```text
/student/*
/learn/:courseId/:lessonId
/exam/:id
/exam/:id/result
```

Logic:

```text
chưa login → /login
role khác student → dashboard đúng role
student → cho vào
```

---

## TeacherGuard

Áp dụng cho:

```text
/lecturer/*
```

Logic:

```text
chưa login → /login
role khác teacher → dashboard đúng role
teacher status pending → trang chờ duyệt
teacher status rejected → trang bị từ chối
teacher status null → trang hoàn thiện hồ sơ
teacher status approved → cho vào dashboard
```

---

## AdminGuard

Áp dụng cho:

```text
/admin/*
```

Logic:

```text
chưa login → /login
role khác admin → dashboard đúng role
admin → cho vào
```

---

# 7. LAYOUT CHUNG

## Public Header

Menu:

* Trang chủ
* Khóa học
* Luyện thi
* Giảng viên
* Tin tức
* Liên hệ

Khi chưa đăng nhập:

* Đăng nhập
* Đăng ký

Khi học sinh đăng nhập:

* Khóa học của tôi
* Thông báo
* Avatar

Avatar dropdown:

* Hồ sơ cá nhân
* Khóa học của tôi
* Điểm số
* Tiến độ
* Đăng xuất

---

## DashboardTopbar

Dùng chung cho Student, Teacher, Admin.

Không dùng avatar cứng.

Lấy từ AuthContext:

* full_name
* email
* role
* logout

Có:

* Search
* Notifications
* Avatar dropdown
* Logout thật

Logout:

```text
clear token
clear user
navigate /login hoặc /
```

Không dùng Link giả.

---

# 8. PUBLIC PAGES

## Trang chủ

Nguồn dữ liệu:

```text
GET /courses/
GET /news/
```

Chỉ hiển thị khóa học approved.

Sections:

* Hero
* Tìm kiếm nhanh
* Khóa học nổi bật
* Luyện thi nổi bật
* Giảng viên nổi bật nếu có dữ liệu
* Tin tức mới nhất
* CTA học thử
* Footer

Không hiển thị số liệu giả nếu backend chưa có API.

---

## Danh sách khóa học

API:

```text
GET /courses/
GET /course-types
GET /common/subjects
GET /common/grades
```

Filters:

* Từ khóa
* Loại khóa học
* Môn học
* Lớp nếu courseType.requires_grade = true

Nếu requires_grade = false:

```text
ẩn filter lớp
không gửi grade_id
```

---

## Chi tiết khóa học

API:

```text
GET /courses/{course_id}
GET /enrollments/courses/{course_id}/status nếu đã login student
```

Nút:

```text
Chưa login → Đăng nhập để đăng ký
Đã login student, chưa đăng ký → Đăng ký khóa học
Đã đăng ký → Vào học
Teacher/Admin → chỉ xem thông tin
```

Đăng ký:

```text
POST /enrollments/courses/{course_id}
```

---

## Luyện thi

API:

```text
GET /course-types
GET /common/subjects
GET /common/grades
GET /courses/exam-prep/list
```

Logic:

Nếu courseType.requires_grade = true:

```text
Chọn chương trình
→ Chọn lớp
→ Chọn môn
→ Hiển thị khóa học
```

Nếu false:

```text
Chọn chương trình
→ Chọn môn / kỳ thi / khối thi
→ Hiển thị khóa học
```

Không tự chọn Toán.
Không tự chọn lớp 12.
Không hiển thị lớp khi requires_grade = false.

---

## Tin tức

Public News:

```text
GET /news/
GET /news/{news_id}
```

Chỉ hiển thị bài published.

---

## Liên hệ

Form:

* Họ tên
* Email
* Số điện thoại
* Nội dung

API:

```text
POST /contacts/
```

Body:

```text
full_name
email
phone
message
```

Không gửi field topic nếu backend không có.

---

# 9. STUDENT MODULE

Sidebar:

* Tổng quan
* Khóa học của tôi
* Điểm số
* Tiến độ học tập
* Giảng viên của tôi
* Chứng chỉ
* Thông báo
* Hồ sơ cá nhân
* Đăng xuất

---

## Student Dashboard

API:

```text
GET /students/me/statistics
```

Hiển thị:

* Tổng khóa học đã đăng ký
* Tiến độ trung bình
* Điểm trung bình
* Chứng chỉ nếu có

---

## Khóa học của tôi

API:

```text
GET /students/me/courses
```

Lưu ý:

Backend có thể trả Enrollment[], không phải Course[].

Phải xử lý:

```text
enrollment.course
```

Không dùng trực tiếp:

```text
enrollment.title
enrollment.teacher_id
```

---

## Giảng viên của tôi

Không dùng mock.

API:

```text
GET /students/me/courses
```

Logic:

```text
lấy enrollment.course.teacher_id
gom giảng viên không trùng
hiển thị các giảng viên dạy khóa học mà học sinh đã đăng ký
```

Nếu backend chưa trả course hoặc teacher:

```text
hiển thị empty state an toàn, không crash
```

---

## Học bài

Route:

```text
/learn/:courseId/:lessonId
```

API:

```text
GET /lessons/course/{course_id}
GET /progress/courses/{course_id}
GET /comments/course/{course_id}
PATCH /progress/lessons/{lesson_id}
POST /comments/
```

Layout:

* Sidebar bài học
* Video
* Tài liệu
* Ghi chú
* Bình luận

---

## Bài kiểm tra

API:

```text
GET /exams/course/{course_id}
GET /exams/{exam_id}/detail
POST /exams/{exam_id}/submit
GET /exams/attempts/{attempt_id}/result
GET /exams/my-attempts
```

---

## Chứng chỉ

API:

```text
GET /certificates/me
POST /certificates/courses/{course_id}/generate
```

---

# 10. TEACHER MODULE

Sidebar:

* Tổng quan
* Hồ sơ giảng viên
* Khóa học của tôi
* Quản lý bài giảng
* Quản lý tài liệu
* Quản lý bài kiểm tra
* Danh sách học sinh
* Kết quả học tập
* Bình luận / Phản hồi
* Đăng xuất

---

## Dashboard

API:

```text
GET /teachers/me/statistics
```

---

## Hồ sơ giảng viên

API:

```text
POST /teachers/profile
POST /teachers/profile/upload-cv
```

Nếu đã có profile thì hiển thị thông tin hồ sơ.

---

## Khóa học của tôi

API:

```text
GET /teachers/me/courses
```

Nút:

* Thêm khóa học
* Sửa khóa học nếu backend hỗ trợ
* Quản lý bài giảng
* Xem học sinh

Không tạo nút xóa thật nếu backend chưa có API xóa.

---

## Tạo khóa học

API:

```text
POST /courses/
POST /courses/{course_id}/thumbnail
```

Form:

* Tên khóa học
* Mô tả ngắn
* Mô tả đầy đủ
* Giá
* Cấp độ
* Loại khóa học
* Môn học
* Lớp nếu requires_grade = true
* Thumbnail

Nếu requires_grade = false:

```text
ẩn lớp
gửi grade_id = null
```

Sau tạo:

```text
status = pending
hiển thị "Khóa học đã gửi Admin duyệt"
```

---

## Quản lý bài giảng

API:

```text
GET /teachers/me/courses
GET /lessons/course/{course_id}
POST /lessons/sections
POST /lessons/
POST /lessons/upload-video/{lesson_id}
POST /lessons/upload-document/{lesson_id}
```

Bắt buộc có:

* Chọn khóa học
* Chọn chương
* Thêm chương
* Thêm bài giảng

Form thêm bài giảng:

* Tên bài giảng
* Chương
* Loại bài: Video / Tài liệu
* Nội dung mô tả
* Thời lượng
* Upload video nếu loại Video
* Upload tài liệu nếu có
* Nút Lưu

Logic:

```text
POST /lessons/
nếu có video → POST /lessons/upload-video/{lesson_id}
nếu có tài liệu → POST /lessons/upload-document/{lesson_id}
```

Không được thiếu upload video.

---

## Quản lý tài liệu

API:

```text
GET /teachers/me/courses
GET /lessons/course/{course_id}
POST /lessons/upload-document/{lesson_id}
```

Form:

* Chọn khóa học
* Chọn bài giảng
* Upload PDF/DOCX/PPTX
* Nút Upload

---

## Quản lý bài kiểm tra

API:

```text
GET /teachers/me/courses
GET /teachers/me/exams
POST /exams/
POST /exams/questions
POST /exams/answers
```

Form:

* Chọn khóa học
* Tên bài kiểm tra
* Thời gian làm bài
* Điểm tối đa
* Câu hỏi
* Đáp án A/B/C/D
* Chọn đáp án đúng

---

## Danh sách học sinh

API:

```text
GET /teachers/me/courses/{course_id}/students
```

---

# 11. ADMIN MODULE

Sidebar:

* Dashboard
* Duyệt giảng viên
* Duyệt khóa học
* Quản lý tin tức
* Quản lý liên hệ
* Quản lý bình luận
* Danh mục môn học
* Loại khóa học
* Hồ sơ Admin
* Đăng xuất

Không tạo CRUD học sinh/giảng viên nếu backend chưa hỗ trợ.

---

## Dashboard

API:

```text
GET /admin/dashboard/statistics
```

---

## Duyệt giảng viên

API:

```text
GET /admin/teachers/pending
PATCH /admin/teachers/{teacher_profile_id}/approve
PATCH /admin/teachers/{teacher_profile_id}/reject
```

UI:

* Danh sách hồ sơ chờ duyệt
* Xem chi tiết
* Tải CV
* Duyệt
* Từ chối
* Nhập lý do từ chối

---

## Duyệt khóa học

API:

```text
GET /admin/courses/pending
PATCH /admin/courses/{course_id}/approve
PATCH /admin/courses/{course_id}/reject
```

UI:

* Danh sách khóa học chờ duyệt
* Xem chi tiết
* Duyệt
* Từ chối
* Nhập lý do từ chối

---

## Quản lý tin tức

API:

```text
GET /news/
POST /news/
PATCH /news/{news_id}
PATCH /news/{news_id}/hide
```

Lưu ý:

* `PATCH /news/{id}/hide` không trả NewsArticle đầy đủ.
* Sau khi ẩn thì reload list hoặc remove item khỏi list.

Form:

* title
* summary
* content
* category
* is_published

---

## Quản lý liên hệ

API:

```text
GET /contacts/
PATCH /contacts/{contact_id}/process
```

Contact fields:

* id
* full_name
* email
* phone
* message
* status

Không dùng:

* is_processed
* created_at

---

## Quản lý bình luận

API:

```text
GET /admin/comments
PATCH /admin/comments/{comment_id}/pin
PATCH /admin/comments/{comment_id}/unpin
```

---

## Danh mục môn học

API:

```text
GET /common/subjects
POST /common/subjects
```

Chỉ tạo chức năng thêm nếu backend chưa có sửa/xóa.

---

## Loại khóa học

API:

```text
GET /course-types
POST /course-types
```

Form:

* name
* requires_grade

---

# 12. BUTTON RULES

Mọi button phải có hành vi.

Nếu có API:

```text
gọi API thật
```

Nếu không có API:

```text
ẩn button hoặc disable button
ghi tooltip "Backend chưa hỗ trợ"
```

Không có button chết.

Không fake thành công nếu backend không có API.

---

# 13. BACK BUTTON RULES

Mọi trang chi tiết/form cần có nút Quay lại đúng ngữ cảnh.

Không quay bừa về Trang chủ trong Dashboard.

Ví dụ:

* Chi tiết khóa học → /courses
* Học bài → /student/courses
* Thêm khóa học → /lecturer/courses
* Quản lý bài giảng → /lecturer/courses
* Duyệt giảng viên chi tiết → /admin/teacher-approval
* Duyệt khóa học chi tiết → /admin/course-approval
* Thêm tin tức → /admin/news
* Chi tiết liên hệ → /admin/contacts

---

# 14. API STATE RULES

Mọi trang gọi API phải có:

* Loading state
* Empty state
* Error state
* Retry button
* Toast success/error

Không để trắng màn hình khi lỗi API.

---

# 15. COMPONENTS CẦN TẠO

* PublicHeader
* DashboardTopbar
* StudentSidebar
* TeacherSidebar
* AdminSidebar
* CourseCard
* NewsCard
* TeacherCard
* ProtectedRoute
* StudentGuard
* TeacherGuard
* AdminGuard
* LoadingState
* EmptyState
* ErrorState
* ConfirmModal
* Toast
* FileUpload
* VideoUpload
* BackButton

---

# 16. SERVICE LAYER

Tạo service layer rõ ràng:

* authApi
* courseApi
* teacherApi
* adminApi
* lessonApi
* examApi
* studentApi
* commentApi
* newsApi
* contactApi
* notificationApi
* certificateApi
* commonApi

Base URL:

```text
http://localhost:8000
```

Header token:

```text
Authorization: Bearer <access_token>
```

---

# 17. FINAL CHECKLIST

Trước khi hoàn thành, kiểm tra:

* Không có route chết.
* Không có button chết.
* Không có mock data làm logic chính.
* Không có logout giả.
* Không có chọn role thủ công ở login production.
* Không có Design System route trong navigation.
* Giảng viên thêm bài giảng có upload video.
* Giảng viên upload tài liệu được.
* Admin duyệt giảng viên gọi API thật.
* Admin duyệt khóa học gọi API thật.
* Admin quản lý tin tức gọi API thật.
* Admin quản lý liên hệ gọi API thật.
* StudentMyLecturers lấy từ khóa học đã đăng ký.
* Contact dùng status, không dùng is_processed.
* News hide xử lý đúng response.
* Course/luyện thi dùng requires_grade.
* Không yêu cầu chọn lớp nếu requires_grade = false.
* Không tự động chọn Toán.
* Không tự động chọn lớp 12.
* UI tiếng Việt 100%.
* Thiết kế sẵn sàng để code React kết nối FastAPI.
