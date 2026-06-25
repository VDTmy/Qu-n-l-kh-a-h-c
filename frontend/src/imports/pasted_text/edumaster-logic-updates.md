# EDUMASTER - SỬA LOGIC CUỐI VÀ BỔ SUNG CÁCH XEM DASHBOARD GIẢNG VIÊN / ADMIN

Hãy sửa bản EduMaster hiện tại để khớp backend FastAPI, đúng logic nghiệp vụ và dễ test các role Học sinh, Giảng viên, Admin.

Không đổi giao diện chính. Không xóa module hiện có. Chỉ sửa logic, route, guard, form, API payload, dashboard access và các nút bấm.

---

## 1. Sửa flow đăng nhập theo đúng nghiệp vụ

Hiện tại học sinh đăng nhập xong đang chuyển vào:

```text
/student/dashboard
```

Điều này sai.

Sửa flow:

```text
student → /
teacher → /lecturer/dashboard nếu approved
admin → /admin/dashboard
```

Cụ thể:

* Nếu role = student: navigate("/")
* Nếu role = admin: navigate("/admin/dashboard")
* Nếu role = teacher:

  * nếu teacherStatus = approved → navigate("/lecturer/dashboard")
  * nếu teacherStatus = pending → navigate("/teacher-pending")
  * nếu teacherStatus = rejected → navigate("/teacher-rejected")
  * nếu teacherStatus = null → navigate("/teacher-complete-profile")

Không cho học sinh tự động vào dashboard sau login.

---

## 2. Bổ sung chế độ test role để dễ xem Dashboard

Hiện tại người dùng chưa biết làm sao xem dashboard của Giảng viên và Admin.

Hãy bổ sung phần "Tài khoản demo" ở trang Login.

Hiển thị box nhỏ bên dưới form login:

```text
Tài khoản demo

Học sinh:
Email: student@edumaster.vn
Mật khẩu: 123456

Giảng viên:
Email: teacher@edumaster.vn
Mật khẩu: 123456

Admin:
Email: admin@edumaster.vn
Mật khẩu: 123456
```

Thêm 3 nút:

```text
Đăng nhập demo Học sinh
Đăng nhập demo Giảng viên
Đăng nhập demo Admin
```

Khi bấm:

* Tự điền email/password vào form.
* Nếu đang ở chế độ prototype thì có thể set role demo và navigate đúng dashboard.
* Nếu đang kết nối backend thật thì vẫn gọi `POST /auth/login`.

Ghi chú trên UI:

```text
Tài khoản demo chỉ dùng để kiểm thử giao diện.
Khi kết nối backend thật, hệ thống sẽ lấy role từ API đăng nhập.
```

---

## 3. Sửa TeacherGuard

Hiện TeacherGuard mới kiểm tra role = teacher, chưa kiểm tra trạng thái duyệt.

Sửa logic:

```text
Nếu chưa đăng nhập → /login
Nếu role không phải teacher → chuyển về dashboard đúng role
Nếu teacherStatus = approved → cho vào /lecturer/*
Nếu teacherStatus = pending → /teacher-pending
Nếu teacherStatus = rejected → /teacher-rejected
Nếu teacherStatus = null → /teacher-complete-profile
```

Tạo 3 trang trạng thái:

### /teacher-pending

Nội dung:

```text
Hồ sơ giảng viên đang chờ duyệt
Admin đang kiểm tra CV và thông tin chuyên môn của bạn.
Bạn sẽ nhận thông báo khi hồ sơ được phê duyệt.
```

Nút:

```text
Quay về trang chủ
Đăng xuất
```

### /teacher-rejected

Nội dung:

```text
Hồ sơ giảng viên bị từ chối
Lý do: {rejection_reason}
Vui lòng cập nhật lại hồ sơ hoặc liên hệ Admin.
```

Nút:

```text
Cập nhật hồ sơ
Đăng xuất
```

### /teacher-complete-profile

Nội dung:

```text
Bạn cần hoàn thiện hồ sơ giảng viên trước khi sử dụng hệ thống.
```

Form gồm:

* Số điện thoại
* Chuyên môn
* Kinh nghiệm
* Giới thiệu bản thân
* Upload CV

Nút:

```text
Gửi hồ sơ xét duyệt
```

---

## 4. Sửa đăng ký giảng viên

Flow đăng ký giảng viên phải là:

```text
POST /auth/register role=teacher
→ tự động login bằng email/password vừa đăng ký
→ lưu access_token tạm
→ POST /teachers/profile
→ POST /teachers/profile/upload-cv
→ logout
→ chuyển đến /teacher-pending
```

Không gọi `POST /teachers/profile` nếu chưa có token.

Form đăng ký giảng viên gồm:

* Họ tên
* Email
* Mật khẩu
* Xác nhận mật khẩu
* Số điện thoại
* Chuyên môn
* Kinh nghiệm
* Giới thiệu bản thân
* Upload CV

Tên field gửi backend phải đúng:

```text
phone
expertise
experience
bio
```

Không dùng `specialty` nếu backend dùng `expertise`.

---

## 5. Sửa tạo bài giảng của Giảng viên

Trang `TeacherLessons` hoặc `LecturerManageLessons` hiện đã có upload video nhưng payload tạo lesson còn thiếu `course_id`.

Sửa form tạo bài giảng gồm:

* Chọn khóa học
* Chọn chương học
* Tên bài giảng
* Loại bài: Video / Tài liệu
* Mô tả nội dung
* Thời lượng
* Upload video nếu loại Video
* Upload tài liệu nếu có
* Nút Lưu bài giảng

Khi lưu:

Bước 1:

```text
POST /lessons/
```

Body phải có:

```json
{
  "course_id": 1,
  "section_id": 1,
  "title": "",
  "lesson_type": "video",
  "description": "",
  "duration": 30
}
```

Bước 2 nếu có video:

```text
POST /lessons/upload-video/{lesson_id}
```

FormData:

```text
file
```

Bước 3 nếu có tài liệu:

```text
POST /lessons/upload-document/{lesson_id}
```

FormData:

```text
file
```

Không được thiếu upload video trong form thêm bài giảng video.

Không được chỉ thêm bài vào state giả.

---

## 6. Sửa nộp bài kiểm tra của học sinh

Hiện `examApi.submit` đang gửi sai dạng:

```json
{
  "answers": {
    "1": 2,
    "2": 5
  }
}
```

Sửa thành đúng backend:

```json
{
  "answers": [
    {
      "question_id": 1,
      "answer_id": 2
    },
    {
      "question_id": 2,
      "answer_id": 5
    }
  ]
}
```

Khi học sinh bấm Nộp bài:

* Convert selectedAnswers từ object sang array.
* Gọi `POST /exams/{exam_id}/submit`.
* Nếu thành công, chuyển sang `/exam/{exam_id}/result` hoặc result theo attempt_id nếu backend trả attempt_id.

---

## 7. Sửa CourseCard hiển thị đúng loại khóa học

CourseCard phải hiển thị:

* Tên khóa học
* Mô tả ngắn
* Giá
* Cấp độ
* Loại khóa học
* Môn học
* Lớp nếu requires_grade = true

Nếu `courseType.requires_grade = true`:

```text
Lớp 11 | Vật lý
```

Nếu `courseType.requires_grade = false`:

```text
Luyện thi THPT Quốc Gia | Toán
Ôn thi Đại học | Khối A
Đánh giá năng lực | HSA
```

Không hiển thị badge Lớp 12 cho THPT Quốc Gia nếu requires_grade = false.

---

## 8. Sửa trang Luyện thi

Trang Luyện thi phải dùng:

```text
GET /course-types
GET /common/subjects
GET /common/grades
GET /courses/exam-prep/list
```

Logic:

Nếu courseType.requires_grade = true:

```text
Chọn chương trình → Chọn lớp → Chọn môn → Xem khóa học
```

Nếu courseType.requires_grade = false:

```text
Chọn chương trình → Chọn môn / khối / kỳ thi → Xem khóa học
```

Không tự chọn Toán.

Không tự chọn Lớp 12.

Không hiển thị chọn lớp với:

* Ôn thi Đại học
* Đánh giá năng lực
* Luyện thi THPT Quốc Gia

---

## 9. Sửa Admin Dashboard và các tác vụ Admin

Admin phải vào được bằng:

```text
/login → tài khoản admin → /admin/dashboard
```

AdminSidebar gồm:

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

Không tạo menu nếu backend không có API.

Các trang Admin phải gọi API thật:

### Duyệt giảng viên

```text
GET /admin/teachers/pending
PATCH /admin/teachers/{teacher_profile_id}/approve
PATCH /admin/teachers/{teacher_profile_id}/reject
```

Nút:

* Xem hồ sơ
* Tải CV
* Duyệt
* Từ chối
* Nhập lý do từ chối

### Duyệt khóa học

```text
GET /admin/courses/pending
PATCH /admin/courses/{course_id}/approve
PATCH /admin/courses/{course_id}/reject
```

Nút:

* Xem chi tiết
* Duyệt
* Từ chối

### Tin tức

```text
GET /news/
POST /news/
PATCH /news/{news_id}
PATCH /news/{news_id}/hide
```

### Liên hệ

```text
GET /contacts/
PATCH /contacts/{contact_id}/process
```

Contact dùng:

```text
status
```

Không dùng:

```text
is_processed
```

### Bình luận

```text
GET /admin/comments
PATCH /admin/comments/{comment_id}/pin
PATCH /admin/comments/{comment_id}/unpin
```

### Danh mục môn học

```text
GET /common/subjects
POST /common/subjects
```

### Loại khóa học

```text
GET /course-types
POST /course-types
```

---

## 10. Sửa button chết

Rà toàn bộ hệ thống.

Mỗi button phải có hành vi:

* gọi API
* navigate
* mở modal
* hiển thị toast
* disable nếu backend chưa hỗ trợ

Không để nút bấm không phản hồi.

Kiểm tra kỹ:

### Student

* Đăng ký khóa học
* Vào học
* Học tiếp
* Nộp bài
* Xem kết quả
* Gửi bình luận
* Quay lại

### Teacher

* Thêm khóa học
* Tạo chương
* Thêm bài giảng
* Upload video
* Upload tài liệu
* Tạo bài kiểm tra
* Thêm câu hỏi
* Xem học sinh
* Quay lại

### Admin

* Duyệt giảng viên
* Từ chối giảng viên
* Tải CV
* Duyệt khóa học
* Từ chối khóa học
* Thêm tin tức
* Sửa tin tức
* Ẩn tin tức
* Xử lý liên hệ
* Ghim bình luận
* Bỏ ghim bình luận
* Thêm môn học
* Thêm loại khóa học
* Quay lại

---

## 11. Sửa nút Quay lại đúng ngữ cảnh

Không quay về Trang chủ khi đang ở Dashboard.

Quy tắc:

* Chi tiết khóa học → /courses
* Chi tiết tin tức → /news
* Học bài → /student/courses
* Làm bài kiểm tra → /student/courses hoặc /student/scores
* Thêm khóa học → /lecturer/courses
* Quản lý bài giảng → /lecturer/courses
* Duyệt giảng viên chi tiết → /admin/teacher-approval
* Duyệt khóa học chi tiết → /admin/course-approval
* Thêm/Sửa tin tức → /admin/news
* Chi tiết liên hệ → /admin/contacts

---

## 12. Sửa loading/empty/error state

Tất cả trang gọi API phải có:

* Loading
* Empty state
* Error state
* Retry
* Toast thông báo

Áp dụng cho:

* Student courses
* Student scores
* Student lecturers
* Teacher courses
* Teacher lessons
* Teacher exams
* Admin teacher approval
* Admin course approval
* Admin news
* Admin contacts
* Admin comments
* Subjects
* Course types

---

## 13. Checklist cuối

Sau khi sửa, đảm bảo:

* Học sinh đăng nhập xong về Trang chủ.
* Có tài khoản demo để test dashboard Student/Teacher/Admin.
* TeacherGuard chỉ cho teacher approved vào dashboard.
* Teacher pending/rejected/null có trang riêng.
* Đăng ký giảng viên đúng flow token.
* Form tạo bài giảng có upload video.
* Tạo lesson gửi đủ course_id.
* Nộp bài kiểm tra gửi answers dạng array.
* CourseCard hiển thị đúng requires_grade.
* Luyện thi không tự chọn Toán/lớp.
* Admin dashboard xem được bằng tài khoản admin.
* Admin tác vụ gọi API thật.
* Không có button chết.
* Không có route chết.
* Logout thật.
* UI tiếng Việt 100%.
* Sẵn sàng kết nối backend FastAPI.
