# MỤC ĐÍCH:
# Admin quản lý loại khóa học.

from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException

from sqlalchemy.orm import Session

from app.database import get_db

from app.models.course_type import CourseType
from app.models.user import User

from app.schemas.course_type import (
    CourseTypeCreate,
    CourseTypeResponse
)

from app.core.deps import require_admin


router = APIRouter(
    prefix="/course-types",
    tags=["Course Types"]
)

# MỤC ĐÍCH:
# Admin thêm loại khóa học.

@router.post(
    "/",
    response_model=CourseTypeResponse
)
def create_course_type(
    data: CourseTypeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):

    existing = (
        db.query(CourseType)
        .filter(
            CourseType.name == data.name
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Loại khóa học đã tồn tại"
        )

    course_type = CourseType(
        name=data.name,
        requires_grade=data.requires_grade
    )

    db.add(course_type)

    db.commit()

    db.refresh(course_type)

    return course_type


# MỤC ĐÍCH:
# Frontend dùng để hiển thị dropdown loại khóa học.

@router.get(
    "/",
    response_model=list[CourseTypeResponse]
)
def get_course_types(
    db: Session = Depends(get_db)
):
    return db.query(
        CourseType
    ).all()