# MỤC ĐÍCH:
# Router này quản lý chương học và bài học.
# Chỉ giảng viên đã được duyệt mới được tạo section/lesson.

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db

from app.models.user import User
from app.models.course import Course
from app.models.course_section import CourseSection
from app.models.lesson import Lesson
from app.models.course_section import CourseSection

from app.schemas.lesson import SectionCreate, SectionResponse
from app.schemas.lesson import LessonCreate, LessonResponse

from app.core.deps import require_approved_teacher

from fastapi import UploadFile
from fastapi import File

import shutil
import os


router = APIRouter(
    prefix="/lessons",
    tags=["Lessons"]
)

# MỤC ĐÍCH:
# API này cho giảng viên tạo chương/phần học trong khóa học của mình.
# Điều kiện:
# - Teacher phải được duyệt.
# - Course phải tồn tại.
# - Course phải thuộc về chính teacher đang đăng nhập.

@router.post(
    "/sections",
    response_model=SectionResponse
)
def create_section(
    data: SectionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_approved_teacher)
):
    course = (
        db.query(Course)
        .filter(Course.id == data.course_id)
        .first()
    )

    if not course:
        raise HTTPException(
            status_code=404,
            detail="Không tìm thấy khóa học"
        )

    if course.teacher_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Bạn không được sửa khóa học của giảng viên khác"
        )

    section = CourseSection(
        course_id=data.course_id,
        title=data.title,
        order_index=data.order_index
    )

    db.add(section)
    db.commit()
    db.refresh(section)

    return section


# MỤC ĐÍCH:
# API này cho giảng viên tạo bài học trong một chương.
# Điều kiện:
# - Teacher phải được duyệt.
# - Section phải tồn tại.
# - Section thuộc course của chính teacher đang đăng nhập.

@router.post(
    "/",
    response_model=LessonResponse
)
def create_lesson(
    data: LessonCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_approved_teacher)
):
    section = (
        db.query(CourseSection)
        .filter(CourseSection.id == data.section_id)
        .first()
    )

    if not section:
        raise HTTPException(
            status_code=404,
            detail="Không tìm thấy chương học"
        )

    course = (
        db.query(Course)
        .filter(Course.id == section.course_id)
        .first()
    )

    if course.teacher_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Bạn không được thêm bài học vào khóa học của giảng viên khác"
        )

    lesson = Lesson(
    section_id=data.section_id,
    title=data.title,
    lesson_type=data.lesson_type,
    content=data.content,
    duration_minutes=data.duration_minutes,
    order_index=data.order_index,
    is_free=data.is_free
)

    db.add(lesson)
    db.commit()
    db.refresh(lesson)

    return lesson


# MỤC ĐÍCH:
# Lấy tất cả bài học của một khóa học dưới dạng danh sách phẳng.
# Frontend TeacherLessons và LearnPage cần dạng này để map theo section_id.

@router.get("/course/{course_id}")
def get_lessons_by_course(
    course_id: int,
    db: Session = Depends(get_db)
):
    sections = (
        db.query(CourseSection)
        .filter(CourseSection.course_id == course_id)
        .order_by(CourseSection.order_index.asc())
        .all()
    )

    result = []

    for section in sections:
        lessons = (
            db.query(Lesson)
            .filter(Lesson.section_id == section.id)
            .order_by(Lesson.order_index.asc())
            .all()
        )

        for lesson in lessons:
            result.append({
                "id": lesson.id,
                "section_id": lesson.section_id,
                "title": lesson.title,
                "content": lesson.content,
                "video_url": lesson.video_url,
                "document_url": lesson.document_url,
                "duration_minutes": lesson.duration_minutes,
                "order_index": lesson.order_index,
                "is_free": lesson.is_free,
                "section": {
                    "id": section.id,
                    "course_id": section.course_id,
                    "title": section.title,
                    "order_index": section.order_index
                }
            })

    return result


# MỤC ĐÍCH:
# Upload video cho bài học.
# Chỉ teacher sở hữu khóa học mới upload được.

@router.post("/upload-video/{lesson_id}")
def upload_lesson_video(
    lesson_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_approved_teacher)
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
        .filter(
            CourseSection.id == lesson.section_id
        )
        .first()
    )

    course = (
        db.query(Course)
        .filter(
            Course.id == section.course_id
        )
        .first()
    )

    if course.teacher_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Bạn không sở hữu khóa học này"
        )

    os.makedirs(
        "uploads/videos",
        exist_ok=True
    )

    file_path = (
        f"uploads/videos/"
        f"{lesson_id}_{file.filename}"
    )

    with open(
        file_path,
        "wb"
    ) as buffer:
        shutil.copyfileobj(
            file.file,
            buffer
        )

    lesson.video_url = (
    f"/uploads/videos/{lesson_id}_{file.filename}"
)

    db.commit()

    return {
        "message": "Upload video thành công",
        "video_url": file_path
    }


# MỤC ĐÍCH:
# Upload PDF tài liệu cho bài học.

@router.post("/upload-document/{lesson_id}")
def upload_lesson_document(
    lesson_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_approved_teacher)
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
        .filter(
            CourseSection.id == lesson.section_id
        )
        .first()
    )

    course = (
        db.query(Course)
        .filter(
            Course.id == section.course_id
        )
        .first()
    )

    if course.teacher_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Bạn không sở hữu khóa học này"
        )

    os.makedirs(
        "uploads/documents",
        exist_ok=True
    )

    file_path = (
        f"uploads/documents/"
        f"{lesson_id}_{file.filename}"
    )

    with open(
        file_path,
        "wb"
    ) as buffer:
        shutil.copyfileobj(
            file.file,
            buffer
        )

    lesson.document_url = (
    f"/uploads/documents/{lesson_id}_{file.filename}"
)

    db.commit()

    return {
        "message": "Upload tài liệu thành công",
        "document_url": file_path
    }


# MỤC ĐÍCH:
# Lấy danh sách chương theo khóa học.
# Dùng cho màn TeacherLessons để hiện chương ngay cả khi chưa có bài giảng.

@router.get("/sections/course/{course_id}")
def get_sections_by_course(
    course_id: int,
    db: Session = Depends(get_db)
):
    sections = (
        db.query(CourseSection)
        .filter(CourseSection.course_id == course_id)
        .order_by(CourseSection.order_index.asc())
        .all()
    )

    return sections