# MỤC ĐÍCH:
# Router này xử lý tiến độ học của học sinh.
# Bao gồm:
# - Đánh dấu hoàn thành bài học
# - Cập nhật % tiến độ khóa học
# - Xem tiến độ của tôi trong một khóa học

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db

from app.models.user import User
from app.models.course import Course
from app.models.course_section import CourseSection
from app.models.lesson import Lesson
from app.models.enrollment import Enrollment
from app.models.lesson_progress import LessonProgress

from app.schemas.lesson_progress import LessonProgressUpdate
from app.schemas.lesson_progress import LessonProgressResponse
from app.models.certificate import Certificate
import uuid
from app.core.deps import require_student


router = APIRouter(
    prefix="/progress",
    tags=["Progress"]
)


# MỤC ĐÍCH:
# API này cho học sinh cập nhật tiến độ một bài học.
# Điều kiện:
# - User phải là student.
# - Lesson phải tồn tại.
# - Student phải đã đăng ký khóa học chứa lesson đó.
# - Nếu đã có progress thì cập nhật.
# - Nếu chưa có progress thì tạo mới.

@router.patch(
    "/lessons/{lesson_id}",
    response_model=LessonProgressResponse
)
def update_lesson_progress(
    lesson_id: int,
    data: LessonProgressUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_student)
):
    lesson = (
        db.query(Lesson)
        .filter(Lesson.id == lesson_id)
        .first()
    )

    if not lesson:
        raise HTTPException(
            status_code=404,
            detail="Không tìm thấy bài học"
        )

    section = (
        db.query(CourseSection)
        .filter(CourseSection.id == lesson.section_id)
        .first()
    )

    course_id = section.course_id

    enrollment = (
        db.query(Enrollment)
        .filter(
            Enrollment.student_id == current_user.id,
            Enrollment.course_id == course_id
        )
        .first()
    )

    if not enrollment:
        raise HTTPException(
            status_code=403,
            detail="Bạn chưa đăng ký khóa học này"
        )

    progress = (
        db.query(LessonProgress)
        .filter(
            LessonProgress.student_id == current_user.id,
            LessonProgress.lesson_id == lesson_id
        )
        .first()
    )

    if not progress:
        progress = LessonProgress(
            student_id=current_user.id,
            lesson_id=lesson_id,
            is_completed=data.is_completed,
            watched_seconds=data.watched_seconds
        )

        db.add(progress)
    else:
        progress.is_completed = data.is_completed
        progress.watched_seconds = data.watched_seconds

    db.commit()
    db.refresh(progress)

    update_course_progress(
        db=db,
        student_id=current_user.id,
        course_id=course_id
    )

    return progress

# MỤC ĐÍCH:
# Hàm này tính lại % tiến độ của học sinh trong một khóa học.
# Công thức:
# số bài đã hoàn thành / tổng số bài trong khóa học * 100

def update_course_progress(
    db: Session,
    student_id: int,
    course_id: int
):
    sections = (
        db.query(CourseSection)
        .filter(CourseSection.course_id == course_id)
        .all()
    )

    section_ids = [
        section.id for section in sections
    ]

    lessons = (
        db.query(Lesson)
        .filter(Lesson.section_id.in_(section_ids))
        .all()
    )

    total_lessons = len(lessons)

    if total_lessons == 0:
        progress_percent = 0
    else:
        lesson_ids = [
            lesson.id for lesson in lessons
        ]

        completed_count = (
            db.query(LessonProgress)
            .filter(
                LessonProgress.student_id == student_id,
                LessonProgress.lesson_id.in_(lesson_ids),
                LessonProgress.is_completed == True
            )
            .count()
        )

        progress_percent = (
            completed_count / total_lessons
        ) * 100

    enrollment = (
        db.query(Enrollment)
        .filter(
            Enrollment.student_id == student_id,
            Enrollment.course_id == course_id
        )
        .first()
    )

    if enrollment:
        enrollment.progress_percent = progress_percent

        if progress_percent == 100:
            enrollment.status = "completed"

            existing_certificate = (
                 db.query(Certificate)
                .filter(
                 Certificate.student_id == student_id,
                Certificate.course_id == course_id
                )
                .first()
            )

        if not existing_certificate:
            certificate = Certificate(
            student_id=student_id,
            course_id=course_id,
            certificate_code=str(uuid.uuid4())
            )

        db.add(certificate)

        db.commit()


# MỤC ĐÍCH:
# API này cho học sinh xem % tiến độ học trong một khóa học.
# Frontend dùng cho dashboard "Khóa học của tôi".

@router.get("/courses/{course_id}")
def get_course_progress(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_student)
):
    enrollment = (
        db.query(Enrollment)
        .filter(
            Enrollment.student_id == current_user.id,
            Enrollment.course_id == course_id
        )
        .first()
    )

    if not enrollment:
        raise HTTPException(
            status_code=404,
            detail="Bạn chưa đăng ký khóa học này"
        )

    return {
        "course_id": course_id,
        "student_id": current_user.id,
        "progress_percent": enrollment.progress_percent,
        "status": enrollment.status
    }