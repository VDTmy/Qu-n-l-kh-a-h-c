# MỤC ĐÍCH:
# Schema này dùng để tạo chương học và bài học.
# Frontend teacher dashboard sẽ gửi dữ liệu theo schema này.

from pydantic import BaseModel


class SectionCreate(BaseModel):
    course_id: int
    title: str
    order_index: int = 1


class SectionResponse(BaseModel):
    id: int
    course_id: int
    title: str
    order_index: int

    class Config:
        from_attributes = True


class LessonCreate(BaseModel):
    section_id: int
    title: str
    content: str | None = None
    duration_minutes: int = 0
    order_index: int = 1
    is_free: bool = False


class LessonResponse(BaseModel):
    id: int
    section_id: int
    title: str
    content: str | None
    video_url: str | None
    document_url: str | None
    duration_minutes: int
    order_index: int
    is_free: bool

    class Config:
        from_attributes = True