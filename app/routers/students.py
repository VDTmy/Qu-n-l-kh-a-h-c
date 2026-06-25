# MỤC ĐÍCH:
# Router này xử lý dữ liệu dashboard học sinh.
# Bao gồm:
# - Khóa học của tôi
# - Tiến độ học tập
# - Điểm số
# - Thống kê cá nhân

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db

from app.models.user import User
from app.models.enrollment import Enrollment
from app.models.exam_attempt import ExamAttempt
from app.models.lesson_progress import LessonProgress
from app.models.exam_attempt import ExamAttempt
from app.models.exam import Exam
from app.models.course import Course

from app.core.deps import require_student


router = APIRouter(
    prefix="/students",
    tags=["Students"]
)

# MỤC ĐÍCH:
# API này trả về các khóa học học sinh đã đăng ký.
# Dùng cho màn Student Dashboard → Khóa học của tôi.

@router.get("/me/courses")
def get_my_student_courses(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_student)
):
    enrollments = (
        db.query(Enrollment)
        .filter(Enrollment.student_id == current_user.id)
        .all()
    )

    return enrollments


# MỤC ĐÍCH:
# API này trả về lịch sử làm bài và điểm số của học sinh.
# Dùng cho màn Student Dashboard → Điểm số.

@router.get("/me/scores")
def get_my_scores(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_student)
):
    attempts = (
        db.query(ExamAttempt)
        .filter(ExamAttempt.student_id == current_user.id)
        .all()
    )

    result = []

    for attempt in attempts:
        exam = db.query(Exam).filter(Exam.id == attempt.exam_id).first()

        course = None
        if exam:
            course = db.query(Course).filter(Course.id == exam.course_id).first()

        result.append({
            "id": attempt.id,
            "score": attempt.score,
            "submitted_at": None,
            "exam": {
                "id": exam.id,
                "title": exam.title,
                "total_score": exam.total_score,
            } if exam else None,
            "course": {
                "id": course.id,
                "title": course.title,
            } if course else None,
        })

    return result

# MỤC ĐÍCH:
# API này trả số liệu tổng quan cho dashboard học sinh:
# - Tổng khóa học đã đăng ký
# - Khóa học đang học
# - Khóa học đã hoàn thành
# - Số bài học đã hoàn thành
# - Số bài thi đã làm
# - Điểm trung bình

@router.get("/me/statistics")
def get_student_statistics(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_student)
):
    total_courses = (
        db.query(Enrollment)
        .filter(Enrollment.student_id == current_user.id)
        .count()
    )

    active_courses = (
        db.query(Enrollment)
        .filter(
            Enrollment.student_id == current_user.id,
            Enrollment.status == "active"
        )
        .count()
    )

    completed_courses = (
        db.query(Enrollment)
        .filter(
            Enrollment.student_id == current_user.id,
            Enrollment.status == "completed"
        )
        .count()
    )

    completed_lessons = (
        db.query(LessonProgress)
        .filter(
            LessonProgress.student_id == current_user.id,
            LessonProgress.is_completed == True
        )
        .count()
    )

    exam_attempts = (
        db.query(ExamAttempt)
        .filter(ExamAttempt.student_id == current_user.id)
        .all()
    )

    total_exam_attempts = len(exam_attempts)

    average_score = 0

    if total_exam_attempts > 0:
        total_score = sum(
            attempt.score for attempt in exam_attempts
        )

        average_score = total_score / total_exam_attempts

    return {
        "courses": {
            "total": total_courses,
            "active": active_courses,
            "completed": completed_courses
        },
        "lessons": {
            "completed": completed_lessons
        },
        "exams": {
            "attempts": total_exam_attempts,
            "average_score": average_score
        }
    }
