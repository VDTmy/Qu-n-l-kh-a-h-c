# MỤC ĐÍCH:
# Router này xử lý API khóa học:
# - Giảng viên tạo khóa học
# - Người dùng xem danh sách khóa học
# - Admin duyệt khóa học sau này

from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException
from fastapi import UploadFile
from fastapi import File
import os
import shutil

from sqlalchemy.orm import Session

from app.database import get_db

from app.models.user import User
from app.models.course import Course
from app.models.course_type import CourseType

from app.schemas.course import CourseCreate
from app.schemas.course import CourseResponse

from app.core.deps import require_approved_teacher


router = APIRouter(
    prefix="/courses",
    tags=["Courses"]
)



# MỤC ĐÍCH:
# API này cho phép giảng viên đã được admin duyệt tạo khóa học.
# Khóa học mới tạo sẽ có status = "pending" để admin duyệt tiếp.
# Logic đặc biệt:
# Nếu loại khóa học requires_grade = True thì bắt buộc phải truyền grade_id.
# Nếu requires_grade = False thì grade_id sẽ tự đưa về None.

@router.post(
    "/",
    response_model=CourseResponse
)
def create_course(
    course_data: CourseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_approved_teacher)
):
    course_type = (
        db.query(CourseType)
        .filter(CourseType.id == course_data.course_type_id)
        .first()
    )

    if not course_type:
        raise HTTPException(
            status_code=404,
            detail="Loại khóa học không tồn tại"
        )

    if course_type.requires_grade and course_data.grade_id is None:
        raise HTTPException(
            status_code=400,
            detail="Loại khóa học này bắt buộc phải chọn lớp"
        )

    final_grade_id = course_data.grade_id

    if not course_type.requires_grade:
        final_grade_id = None

    new_course = Course(
        title=course_data.title,
        short_description=course_data.short_description,
        full_description=course_data.full_description,
        price=course_data.price,
        level=course_data.level,
        teacher_id=current_user.id,
        subject_id=course_data.subject_id,
        grade_id=final_grade_id,
        course_type_id=course_data.course_type_id,
        status="pending"
    )

    db.add(new_course)
    db.commit()
    db.refresh(new_course)

    return new_course



# MỤC ĐÍCH:
# API này trả về danh sách khóa học đã được admin duyệt.
# Frontend trang Khóa học dùng API này để:
# - Tìm kiếm theo tên khóa học
# - Lọc theo môn học
# - Lọc theo lớp
# - Lọc theo loại khóa học

@router.get(
    "/",
    response_model=list[CourseResponse]
)
def get_courses(
    keyword: str | None = None,
    subject_id: int | None = None,
    grade_id: int | None = None,
    course_type_id: int | None = None,
    db: Session = Depends(get_db)
):
    query = (
        db.query(Course)
        .filter(Course.status == "approved")
    )

    if keyword is not None:
        query = query.filter(
            Course.title.ilike(f"%{keyword}%")
        )

    if subject_id is not None:
        query = query.filter(
            Course.subject_id == subject_id
        )

    if grade_id is not None:
        query = query.filter(
            Course.grade_id == grade_id
        )

    if course_type_id is not None:
        query = query.filter(
            Course.course_type_id == course_type_id
        )

    courses = query.all()

    return courses


# MỤC ĐÍCH:
# API này cho học sinh/khách xem chi tiết một khóa học đã được duyệt.

@router.get(
    "/{course_id}",
    response_model=CourseResponse
)
def get_course_detail(
    course_id: int,
    db: Session = Depends(get_db)
):
    course = (
        db.query(Course)
        .filter(
            Course.id == course_id,
            Course.status == "approved"
        )
        .first()
    )

    if not course:
        raise HTTPException(
            status_code=404,
            detail="Không tìm thấy khóa học"
        )

    return course


# MỤC ĐÍCH:
# API này trả về danh sách khóa luyện thi.
# Frontend trang Luyện thi dùng API này.
# Dựa trên tên loại khóa học có chứa chữ "thi".

@router.get(
    "/exam-prep/list",
    response_model=list[CourseResponse]
)
def get_exam_prep_courses(
    db: Session = Depends(get_db)
):
    courses = (
        db.query(Course)
        .join(CourseType, Course.course_type_id == CourseType.id)
        .filter(
            Course.status == "approved",
            CourseType.name.ilike("%thi%")
        )
        .all()
    )

    return courses


# MỤC ĐÍCH:
# Upload ảnh đại diện khóa học.

@router.post(
    "/{course_id}/thumbnail"
)
def upload_course_thumbnail(
    course_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_approved_teacher
    )
):
    course = (
        db.query(Course)
        .filter(
            Course.id == course_id
        )
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
            detail="Không sở hữu khóa học"
        )

    os.makedirs(
        "uploads/course_thumbnails",
        exist_ok=True
    )

    file_path = (
        f"uploads/course_thumbnails/"
        f"{course_id}_{file.filename}"
    )

    with open(
        file_path,
        "wb"
    ) as buffer:
        shutil.copyfileobj(
            file.file,
            buffer
        )

    course.thumbnail_url = (
        f"/uploads/course_thumbnails/"
        f"{course_id}_{file.filename}"
    )

    db.commit()

    return {
        "message": "Upload thumbnail thành công",
        "thumbnail_url": course.thumbnail_url
    }
