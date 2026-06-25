# MỤC ĐÍCH:
# Router này trả dữ liệu cho Trang chủ EduMaster.
# Frontend React chỉ cần gọi GET /home là có:
# - Khóa học đã duyệt
# - Giảng viên đã duyệt
# - Tin tức mới nhất
# - Thống kê tổng quan

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db

from app.models.course import Course
from app.models.teacher import TeacherProfile
from app.models.news import News
from app.models.user import User
from app.models.enrollment import Enrollment


router = APIRouter(
    prefix="/home",
    tags=["Home"]
)


@router.get("/")
def get_home_data(
    db: Session = Depends(get_db)
):
    featured_courses = (
        db.query(Course)
        .filter(Course.status == "approved")
        .limit(6)
        .all()
    )

    featured_teachers = (
        db.query(TeacherProfile)
        .filter(TeacherProfile.status == "approved")
        .limit(6)
        .all()
    )

    latest_news = (
        db.query(News)
        .filter(News.is_published == True)
        .limit(4)
        .all()
    )

    total_students = (
        db.query(User)
        .filter(User.role == "student")
        .count()
    )

    total_teachers = (
        db.query(TeacherProfile)
        .filter(TeacherProfile.status == "approved")
        .count()
    )

    total_courses = (
        db.query(Course)
        .filter(Course.status == "approved")
        .count()
    )

    total_enrollments = (
        db.query(Enrollment)
        .count()
    )

    return {
        "featured_courses": featured_courses,
        "featured_teachers": featured_teachers,
        "latest_news": latest_news,
        "statistics": {
            "students": total_students,
            "teachers": total_teachers,
            "courses": total_courses,
            "enrollments": total_enrollments
        }
    }