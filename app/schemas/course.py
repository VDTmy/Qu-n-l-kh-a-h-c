# MỤC ĐÍCH:
# Schema này quy định dữ liệu khi tạo khóa học và dữ liệu trả về cho frontend.

from pydantic import BaseModel


class CourseCreate(BaseModel):

    title: str

    short_description: str | None = None

    full_description: str | None = None

    price: float = 0

    level: str | None = None

    subject_id: int

    grade_id: int | None = None

    course_type_id: int


class CourseResponse(BaseModel):

    id: int

    title: str

    short_description: str | None

    full_description: str | None

    price: float

    thumbnail_url: str | None

    level: str | None

    status: str

    teacher_id: int

    subject_id: int

    grade_id: int | None

    course_type_id: int

    rejection_reason: str | None

    class Config:
        from_attributes = True