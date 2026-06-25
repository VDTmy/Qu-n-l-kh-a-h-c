
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.teacher import TeacherProfile
from app.models.user import User
from app.models.course import Course
from app.models.comment import Comment
from app.models.enrollment import Enrollment
from app.models.exam import Exam
from app.models.contact import Contact
from app.models.notification import Notification


from app.core.deps import require_admin


router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)

# Ai đang chờ duyệt?
@router.get("/teachers/pending")
def get_pending_teachers(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    teachers = (
        db.query(TeacherProfile)
        .filter(
            TeacherProfile.status == "pending"
        )
        .all()
    )

    result = []

    for teacher in teachers:
        user = (
            db.query(User)
            .filter(User.id == teacher.user_id)
            .first()
        )

        result.append({
            "id": teacher.id,
            "user_id": teacher.user_id,
            "phone": teacher.phone,
            "expertise": teacher.expertise,
            "experience": teacher.experience,
            "bio": teacher.bio,
            "status": teacher.status,
            "cv_file_url": teacher.cv_file_url,
            "rejection_reason": teacher.rejection_reason,

            "user": {
                "id": user.id,
                "full_name": user.full_name,
                "email": user.email,
                "role": user.role
            } if user else None
        })

    return result

# MỤC ĐÍCH:
# API này dùng để Admin duyệt hồ sơ giảng viên.
# Khi duyệt, trạng thái teacher_profiles.status chuyển từ "pending" sang "approved".

@router.patch("/teachers/{teacher_profile_id}/approve")
def approve_teacher(
    teacher_profile_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    teacher_profile = (
        db.query(TeacherProfile)
        .filter(TeacherProfile.id == teacher_profile_id)
        .first()
    )

    if not teacher_profile:
        raise HTTPException(
            status_code=404,
            detail="Không tìm thấy hồ sơ giảng viên"
        )

    teacher_profile.status = "approved"
    teacher_profile.rejection_reason = None
    notification = Notification(
    user_id=teacher_profile.user_id,
    title="Hồ sơ giảng viên đã được duyệt",
    message="Tài khoản giảng viên của bạn đã được Admin duyệt. Bạn có thể bắt đầu tạo khóa học.",
    type="teacher_approved"
)

    db.add(notification)

    db.commit()
    db.refresh(teacher_profile)

    return {
        "message": "Duyệt giảng viên thành công",
        "teacher_profile_id": teacher_profile.id,
        "status": teacher_profile.status
    }

# MỤC ĐÍCH:
# API này dùng để Admin từ chối hồ sơ giảng viên.
# Khi từ chối, trạng thái teacher_profiles.status chuyển thành "rejected".
# Có thể lưu thêm lý do từ chối để hiển thị cho giảng viên.

@router.patch("/teachers/{teacher_profile_id}/reject")
def reject_teacher(
    teacher_profile_id: int,
    reason: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    teacher_profile = (
        db.query(TeacherProfile)
        .filter(TeacherProfile.id == teacher_profile_id)
        .first()
    )

    if not teacher_profile:
        raise HTTPException(
            status_code=404,
            detail="Không tìm thấy hồ sơ giảng viên"
        )

    teacher_profile.status = "rejected"
    teacher_profile.rejection_reason = reason
    notification = Notification(
    user_id=teacher_profile.user_id,
    title="Hồ sơ giảng viên bị từ chối",
    message=f"Hồ sơ giảng viên của bạn bị từ chối. Lý do: {reason}",
    type="teacher_rejected"
)

    db.add(notification)
    

    db.commit()
    db.refresh(teacher_profile)

    return {
        "message": "Từ chối giảng viên thành công",
        "teacher_profile_id": teacher_profile.id,
        "status": teacher_profile.status,
        "rejection_reason": teacher_profile.rejection_reason
    }


# MỤC ĐÍCH:
# API này cho Admin xem danh sách khóa học đang chờ duyệt.
# Chỉ lấy các khóa học có status = "pending".

@router.get("/courses/pending")
def get_pending_courses(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    courses = (
        db.query(Course)
        .filter(Course.status == "pending")
        .all()
    )

    return courses

# MỤC ĐÍCH:
# API này cho Admin duyệt khóa học.
# Khi duyệt, course.status chuyển từ "pending" sang "approved".
# Sau khi approved, học sinh mới nhìn thấy khóa học ở trang danh sách khóa học.

@router.patch("/courses/{course_id}/approve")
def approve_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    course = (
        db.query(Course)
        .filter(Course.id == course_id)
        .first()
    )

    if not course:
        raise HTTPException(
            status_code=404,
            detail="Không tìm thấy khóa học"
        )

    course.status = "approved"
    course.rejection_reason = None
    notification = Notification(
    user_id=course.teacher_id,
    title="Khóa học đã được duyệt",
    message=f"Khóa học '{course.title}' đã được Admin duyệt và hiển thị cho học sinh.",
    type="course_approved"
)

    db.add(notification)

    db.commit()
    db.refresh(course)

    return {
        "message": "Duyệt khóa học thành công",
        "course_id": course.id,
        "status": course.status
    }


# MỤC ĐÍCH:
# API này cho Admin từ chối khóa học.
# Khi từ chối, course.status chuyển thành "rejected".
# Lý do từ chối được lưu vào rejection_reason để giảng viên xem và chỉnh sửa sau.

@router.patch("/courses/{course_id}/reject")
def reject_course(
    course_id: int,
    reason: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    course = (
        db.query(Course)
        .filter(Course.id == course_id)
        .first()
    )

    if not course:
        raise HTTPException(
            status_code=404,
            detail="Không tìm thấy khóa học"
        )

    course.status = "rejected"
    course.rejection_reason = reason
    notification = Notification(
    user_id=course.teacher_id,
    title="Khóa học bị từ chối",
    message=f"Khóa học '{course.title}' bị từ chối. Lý do: {reason}",
    type="course_rejected"
)

    db.add(notification)

    db.commit()
    db.refresh(course)

    return {
        "message": "Từ chối khóa học thành công",
        "course_id": course.id,
        "status": course.status,
        "rejection_reason": course.rejection_reason
    }

# MỤC ĐÍCH:
# API này cho Admin xem toàn bộ bình luận trong hệ thống.
# Dùng cho màn Admin Dashboard → Quản lý bình luận.

@router.get("/comments")
def get_all_comments(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    comments = (
        db.query(Comment)
        .filter(Comment.is_deleted == False)
        .all()
    )

    return comments


# MỤC ĐÍCH:
# API này cho Admin ghim một bình luận quan trọng.
# Ví dụ: câu hỏi hay, câu trả lời quan trọng của giảng viên.

@router.patch("/comments/{comment_id}/pin")
def pin_comment(
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    comment = (
        db.query(Comment)
        .filter(Comment.id == comment_id)
        .first()
    )

    if not comment:
        raise HTTPException(
            status_code=404,
            detail="Không tìm thấy bình luận"
        )

    comment.is_pinned = True

    db.commit()
    db.refresh(comment)

    return {
        "message": "Ghim bình luận thành công",
        "comment_id": comment.id,
        "is_pinned": comment.is_pinned
    }


# MỤC ĐÍCH:
# API này cho Admin bỏ ghim bình luận.

@router.patch("/comments/{comment_id}/unpin")
def unpin_comment(
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    comment = (
        db.query(Comment)
        .filter(Comment.id == comment_id)
        .first()
    )

    if not comment:
        raise HTTPException(
            status_code=404,
            detail="Không tìm thấy bình luận"
        )

    comment.is_pinned = False

    db.commit()
    db.refresh(comment)

    return {
        "message": "Bỏ ghim bình luận thành công",
        "comment_id": comment.id,
        "is_pinned": comment.is_pinned
    }



# MỤC ĐÍCH:
# API này trả về số liệu tổng quan cho Admin Dashboard.
# Frontend dùng để hiển thị các card thống kê như:
# - Tổng học sinh
# - Tổng giảng viên
# - Tổng khóa học
# - Khóa học chờ duyệt
# - Giảng viên chờ duyệt
# - Tổng lượt đăng ký học
# - Tổng bài thi
# - Liên hệ mới

@router.get("/dashboard/statistics")
def get_admin_statistics(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    total_students = (
        db.query(User)
        .filter(User.role == "student")
        .count()
    )

    total_teachers = (
        db.query(User)
        .filter(User.role == "teacher")
        .count()
    )

    total_admins = (
        db.query(User)
        .filter(User.role == "admin")
        .count()
    )

    total_courses = (
        db.query(Course)
        .count()
    )

    approved_courses = (
        db.query(Course)
        .filter(Course.status == "approved")
        .count()
    )

    pending_courses = (
        db.query(Course)
        .filter(Course.status == "pending")
        .count()
    )

    rejected_courses = (
        db.query(Course)
        .filter(Course.status == "rejected")
        .count()
    )

    pending_teachers = (
        db.query(TeacherProfile)
        .filter(TeacherProfile.status == "pending")
        .count()
    )

    approved_teachers = (
        db.query(TeacherProfile)
        .filter(TeacherProfile.status == "approved")
        .count()
    )

    total_enrollments = (
        db.query(Enrollment)
        .count()
    )

    total_exams = (
        db.query(Exam)
        .count()
    )

    new_contacts = (
        db.query(Contact)
        .filter(Contact.status == "new")
        .count()
    )

    return {
        "users": {
            "students": total_students,
            "teachers": total_teachers,
            "admins": total_admins
        },
        "teachers": {
            "pending": pending_teachers,
            "approved": approved_teachers
        },
        "courses": {
            "total": total_courses,
            "approved": approved_courses,
            "pending": pending_courses,
            "rejected": rejected_courses
        },
        "learning": {
            "enrollments": total_enrollments,
            "exams": total_exams
        },
        "contacts": {
            "new": new_contacts
        }
    }