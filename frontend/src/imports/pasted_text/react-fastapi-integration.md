Bạn hãy rà soát và sửa toàn bộ frontend React/TypeScript trong dự án này để kết nối đúng với backend FastAPI EduMaster hiện tại. Giữ nguyên giao diện, layout, màu sắc, component và UX hiện có, chỉ sửa phần API service, type/interface, luồng đăng nhập, route bảo vệ và mapping dữ liệu để frontend chạy đúng với backend.

BACKEND BASE URL:
http://127.0.0.1:8000

YÊU CẦU CHUNG:
1. Không phá giao diện hiện tại.
2. Không đổi tên component nếu không cần thiết.
3. Tất cả API phải gọi qua một axios instance chung.
4. Token JWT lưu trong localStorage với key: access_token.
5. Role lưu trong localStorage với key: role.
6. Mọi request sau đăng nhập phải tự gắn header:
Authorization: Bearer <access_token>
7. Nếu API trả 401 thì tự logout và điều hướng về trang login.
8. Login backend dùng OAuth2PasswordRequestForm, không phải JSON.

API BACKEND HIỆN TẠI:

AUTH:
POST /auth/login
- Request dạng FormData:
  username = email
  password = password
- Response:
{
  "access_token": "...",
  "token_type": "bearer",
  "role": "student" | "teacher" | "admin"
}

GET /auth/me
Response:
{
  "id": number,
  "full_name": string,
  "email": string,
  "role": string
}

REGISTER:
POST /auth/register
Body JSON:
{
  "full_name": string,
  "email": string,
  "password": string,
  "role": "student" | "teacher" | "admin"
}

HOME:
GET /home/
Response:
{
  "featured_courses": Course[],
  "featured_teachers": TeacherProfile[],
  "latest_news": News[],
  "statistics": {
    "students": number,
    "teachers": number,
    "courses": number,
    "enrollments": number
  }
}

COURSES:
GET /courses/
Query optional:
keyword
subject_id
grade_id
course_type_id
page
page_size

GET /courses/{course_id}

POST /courses/
Teacher approved only.
Body:
{
  "title": string,
  "short_description": string,
  "full_description": string,
  "price": number,
  "level": string,
  "subject_id": number,
  "grade_id": number | null,
  "course_type_id": number
}

POST /courses/{course_id}/thumbnail

COMMON:
GET /common/subjects
GET /common/grades
POST /common/subjects
POST /common/grades

COURSE TYPES:
GET /course-types/
POST /course-types/

TEACHERS:
POST /teachers/profile
GET /teachers/me/profile
Nếu backend chưa có thì frontend vẫn chuẩn bị service này, hoặc sửa backend thêm endpoint này.
Response theo backend:
{
  "id": number,
  "user_id": number,
  "phone": string | null,
  "expertise": string | null,
  "experience": string | null,
  "bio": string | null,
  "cv_file_url": string | null,
  "status": "pending" | "approved" | "rejected",
  "rejection_reason": string | null
}

POST /teachers/profile/upload-cv
GET /teachers/me/courses
GET /teachers/me/statistics
GET /teachers/me/exams
GET /teachers/me/courses/{course_id}/students

ADMIN:
GET /admin/teachers/pending
PATCH /admin/teachers/{teacher_profile_id}/approve
PATCH /admin/teachers/{teacher_profile_id}/reject?reason=...

GET /admin/courses/pending
PATCH /admin/courses/{course_id}/approve
PATCH /admin/courses/{course_id}/reject?reason=...

GET /admin/comments
PATCH /admin/comments/{comment_id}/delete
PATCH /admin/comments/{comment_id}/pin
PATCH /admin/comments/{comment_id}/unpin

GET /admin/dashboard/statistics

ENROLLMENTS:
POST /enrollments/courses/{course_id}
GET /enrollments/my-courses
GET /enrollments/courses/{course_id}/status

LƯU Ý: Nếu frontend hiện đang gọi /enrollments/me thì sửa thành /enrollments/my-courses.

LESSONS:
POST /lessons/sections
POST /lessons/
GET /lessons/course/{course_id}
POST /lessons/upload-video/{lesson_id}
POST /lessons/upload-document/{lesson_id}

PROGRESS:
PATCH /progress/lessons/{lesson_id}
GET /progress/courses/{course_id}

EXAMS:
POST /exams/
POST /exams/questions
POST /exams/answers
GET /exams/course/{course_id}
GET /exams/{exam_id}/detail
POST /exams/{exam_id}/submit
GET /exams/my-attempts
GET /exams/attempts/{attempt_id}/result

STUDENTS:
GET /students/me/courses
GET /students/me/scores
GET /students/me/statistics

COMMENTS:
POST /comments/
GET /comments/lessons/{lesson_id}
GET /comments/courses/{course_id}

LƯU Ý: Nếu frontend đang gọi /comments/course/{courseId} thì sửa thành /comments/courses/{courseId}.

NEWS:
GET /news/
GET /news/{news_id}
POST /news/
PATCH /news/{news_id}
PATCH /news/{news_id}/hide

CONTACTS:
POST /contacts/
GET /contacts/
PATCH /contacts/{contact_id}/process

NOTIFICATIONS:
GET /notifications/me
GET /notifications/me/unread-count
Response:
{
  "unread_count": number
}
PATCH /notifications/{notification_id}/read

LƯU Ý: Nếu frontend đang dùng { count: number } thì sửa thành { unread_count: number }.

CERTIFICATES:
POST /certificates/courses/{course_id}/generate
GET /certificates/me

CÁC TYPE/INTERFACE CẦN ĐỒNG BỘ:

User:
{
  id: number;
  full_name: string;
  email: string;
  role: "student" | "teacher" | "admin";
}

Course:
{
  id: number;
  title: string;
  short_description?: string | null;
  full_description?: string | null;
  price: number;
  thumbnail_url?: string | null;
  level?: string | null;
  status: "pending" | "approved" | "rejected";
  teacher_id: number;
  subject_id: number;
  grade_id?: number | null;
  course_type_id: number;
  rejection_reason?: string | null;
}

TeacherProfile:
{
  id: number;
  user_id: number;
  phone?: string | null;
  expertise?: string | null;
  experience?: string | null;
  bio?: string | null;
  cv_file_url?: string | null;
  status: "pending" | "approved" | "rejected";
  rejection_reason?: string | null;
}

KHÔNG dùng các field sai sau nếu có:
teacher_id thay cho user_id trong TeacherProfile
specialty thay cho expertise
cv_url thay cho cv_file_url

Enrollment:
{
  id: number;
  student_id: number;
  course_id: number;
  status: "active" | "completed" | "cancelled";
  progress_percent: number;
}

Notification:
{
  id: number;
  user_id: number;
  title: string;
  message: string;
  type?: string | null;
  is_read: boolean;
}

News:
{
  id: number;
  title: string;
  summary?: string | null;
  content: string;
  thumbnail_url?: string | null;
  category?: string | null;
  is_published: boolean;
  author_id: number;
}

YÊU CẦU SỬA SERVICE:

1. Tạo hoặc sửa src/services/api.ts:
- baseURL = http://127.0.0.1:8000
- interceptor gắn Authorization Bearer token
- response interceptor xử lý 401 logout

2. Sửa authApi:
- login phải gửi FormData:
  formData.append("username", email)
  formData.append("password", password)
- lưu access_token và role
- gọi /auth/me để lấy user hiện tại

3. Sửa enrollmentApi:
- myCourses phải gọi /enrollments/my-courses
- checkStatus gọi /enrollments/courses/{courseId}/status
- enroll gọi POST /enrollments/courses/{courseId}

4. Sửa commentApi:
- byCourse gọi /comments/courses/{courseId}
- byLesson gọi /comments/lessons/{lessonId}

5. Sửa notificationApi:
- unread count dùng unread_count, không dùng count.

6. Sửa teacherApi:
- profile dùng /teachers/me/profile nếu có.
- myCourses dùng /teachers/me/courses
- statistics dùng /teachers/me/statistics
- exams dùng /teachers/me/exams
- studentsInCourse dùng /teachers/me/courses/{courseId}/students

7. Sửa adminApi:
- pending teachers: /admin/teachers/pending
- approve teacher: PATCH /admin/teachers/{id}/approve
- reject teacher: PATCH /admin/teachers/{id}/reject?reason=...
- pending courses: /admin/courses/pending
- approve course: PATCH /admin/courses/{id}/approve
- reject course: PATCH /admin/courses/{id}/reject?reason=...
- statistics: /admin/dashboard/statistics

8. Sửa courseApi:
- list dùng GET /courses/ với query params.
- detail dùng GET /courses/{id}
- create dùng POST /courses/
- upload thumbnail dùng POST /courses/{id}/thumbnail với FormData.

9. Sửa lessonApi:
- sections: POST /lessons/sections
- create lesson: POST /lessons/
- get by course: GET /lessons/course/{courseId}
- upload video: POST /lessons/upload-video/{lessonId}
- upload document: POST /lessons/upload-document/{lessonId}

10. Sửa examApi:
- get exams by course: GET /exams/course/{courseId}
- detail: GET /exams/{examId}/detail
- submit: POST /exams/{examId}/submit
- my attempts: GET /exams/my-attempts
- result: GET /exams/attempts/{attemptId}/result

YÊU CẦU ROUTING:
- Nếu chưa login thì không cho vào dashboard.
- Nếu role = student thì vào student dashboard.
- Nếu role = teacher thì vào teacher dashboard.
- Nếu role = admin thì vào admin dashboard.
- Không cho student vào teacher/admin dashboard.
- Không cho teacher vào admin dashboard.
- Logout phải xóa access_token và role.

YÊU CẦU HIỂN THỊ FILE:
Backend trả file url dạng:
/uploads/...
Khi hiển thị ảnh/video/pdf phải ghép:
http://127.0.0.1:8000 + file_url

Ví dụ:
thumbnail_url = "/uploads/course_thumbnails/1_math.png"
src = "http://127.0.0.1:8000" + thumbnail_url

YÊU CẦU CUỐI:
Sau khi sửa xong, frontend phải chạy được:
npm run dev

Và test được các luồng:
1. Login student/teacher/admin.
2. Trang chủ lấy dữ liệu từ /home/.
3. Danh sách khóa học lấy từ /courses/.
4. Student xem khóa học của tôi từ /students/me/courses hoặc /enrollments/my-courses.
5. Teacher xem dashboard từ /teachers/me/statistics.
6. Admin xem thống kê từ /admin/dashboard/statistics.
7. Admin duyệt teacher/course đúng endpoint.
8. Notification hiển thị từ /notifications/me.