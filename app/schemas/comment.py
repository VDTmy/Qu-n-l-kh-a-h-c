# MỤC ĐÍCH:
# Schema này dùng để tạo và trả dữ liệu bình luận.

from pydantic import BaseModel


class CommentCreate(BaseModel):
    course_id: int
    lesson_id: int | None = None
    parent_id: int | None = None
    content: str


class CommentResponse(BaseModel):
    id: int
    course_id: int
    lesson_id: int | None
    user_id: int
    parent_id: int | None
    content: str
    is_pinned: bool
    is_deleted: bool

    class Config:
        from_attributes = True