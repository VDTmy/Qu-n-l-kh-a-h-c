from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.database import engine, Base

from app.models.user import User
from app.models.teacher import TeacherProfile
from app.models.subject import Subject
from app.models.grade import Grade
from app.models.course_type import CourseType
from app.routers.course_types import (
    router as course_types_router
)
from app.models.course import Course
from app.models.course_section import CourseSection
from app.models.lesson import Lesson
from app.models.enrollment import Enrollment
from app.models.lesson_progress import LessonProgress
from app.models.exam import Exam
from app.models.question import Question
from app.models.answer import Answer
from app.models.exam_attempt import ExamAttempt
from app.models.student_answer import StudentAnswer
from app.models.comment import Comment
from app.models.news import News
from app.models.contact import Contact
from app.models.notification import Notification
from app.models.certificate import Certificate


from app.routers.auth import router as auth_router
from app.routers.test_role import router as test_role_router
from app.routers.teachers import router as teachers_router
from app.routers.admin import router as admin_router
from app.routers.common import router as common_router
from app.routers.courses import router as courses_router
from app.routers.lessons import router as lessons_router
from app.routers.enrollments import router as enrollments_router
from app.routers.progress import router as progress_router
from app.routers.exams import router as exams_router
from app.routers.comments import router as comments_router
from app.routers.news import router as news_router
from app.routers.contacts import router as contacts_router
from app.routers.home import router as home_router
from app.routers.students import router as students_router
from app.routers.notifications import router as notifications_router
from app.routers.certificates import (
    router as certificates_router
)

app = FastAPI(
    title="EduMaster API",
    description="Backend API cho hệ thống học trực tuyến EduMaster",
    version="1.0.0"
)

Base.metadata.create_all(bind=engine)


@app.get("/")
def home():
    return {
        "message": "EduMaster API is running"
    }

app.include_router(auth_router)
app.include_router(test_role_router)
app.include_router(teachers_router)
app.include_router(admin_router)
app.include_router(common_router)
app.include_router(course_types_router)
app.include_router(courses_router)
app.include_router(lessons_router)
app.include_router(enrollments_router)
app.include_router(progress_router)
app.include_router(exams_router)
app.include_router(comments_router)
app.include_router(news_router)
app.include_router(contacts_router)
app.include_router(home_router)
app.include_router(students_router)
app.include_router(notifications_router)
app.include_router(certificates_router)

# MỤC ĐÍCH:
# Cho phép frontend React gọi API backend.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# MỤC ĐÍCH:
# Cho phép truy cập file upload bằng URL.
app.mount(
    "/uploads",
    StaticFiles(directory="uploads"),
    name="uploads"
)