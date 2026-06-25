# MỤC ĐÍCH:
# Router này xử lý nghiệp vụ học sinh đăng ký khóa học,
# xem khóa học của tôi và kiểm tra trạng thái đăng ký.

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db

from app.models.user import User
from app.models.course import Course
from app.models.enrollment import Enrollment
from app.models.notification import Notification

from app.schemas.enrollment import EnrollmentResponse

from app.core.deps import require_student


router = APIRouter(
    prefix="/enrollments",
    tags=["Enrollments"]
)

# MỤC ĐÍCH:
# API này cho học sinh đăng ký một khóa học đã được admin duyệt.
# Điều kiện:
# - User phải là student.
# - Course phải tồn tại.
# - Course phải status = "approved".
# - Không được đăng ký trùng một khóa học.

@router.post(
    "/courses/{course_id}",
    response_model=EnrollmentResponse
)
def enroll_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_student)
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

    if course.status != "approved":
        raise HTTPException(
            status_code=400,
            detail="Khóa học chưa được duyệt"
        )

    existing_enrollment = (
        db.query(Enrollment)
        .filter(
            Enrollment.student_id == current_user.id,
            Enrollment.course_id == course_id
        )
        .first()
    )

    if existing_enrollment:
        raise HTTPException(
            status_code=400,
            detail="Bạn đã đăng ký khóa học này rồi"
        )

    enrollment = Enrollment(
        student_id=current_user.id,
        course_id=course_id,
        status="active",
        progress_percent=0
    )

    db.add(enrollment)
    db.commit()
    db.refresh(enrollment)
    notification = Notification(
    user_id=course.teacher_id,
    title="Có học sinh mới đăng ký khóa học",
    message=f"Học sinh {current_user.full_name} đã đăng ký khóa học '{course.title}'.",
    type="new_enrollment"
    )

    db.add(notification)
    db.commit()


    return enrollment



# MỤC ĐÍCH:
# Học sinh xem danh sách khóa học đã đăng ký.
# Trả kèm thông tin khóa học và giảng viên để frontend hiển thị đẹp.

@router.get("/my-courses")
def get_my_courses(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_student)
):
    enrollments = (
        db.query(Enrollment)
        .filter(
            Enrollment.student_id == current_user.id
        )
        .all()
    )

    result = []

    for enrollment in enrollments:
        course = (
            db.query(Course)
            .filter(Course.id == enrollment.course_id)
            .first()
        )

        teacher = None

        if course:
            teacher = (
                db.query(User)
                .filter(User.id == course.teacher_id)
                .first()
            )

        result.append({
            "id": enrollment.id,
            "student_id": enrollment.student_id,
            "course_id": enrollment.course_id,
            "status": enrollment.status,
            "progress_percent": enrollment.progress_percent,
            "course": {
                "id": course.id,
                "title": course.title,
                "short_description": course.short_description,
                "price": course.price,
                "thumbnail_url": course.thumbnail_url,
                "level": course.level,
                "status": course.status,
                "teacher_id": course.teacher_id,
                "subject_id": course.subject_id,
                "grade_id": course.grade_id,
                "course_type_id": course.course_type_id,
                "teacher": {
                    "id": teacher.id,
                    "full_name": teacher.full_name,
                    "email": teacher.email,
                    "role": teacher.role
                } if teacher else None
            } if course else None
        })

    return result