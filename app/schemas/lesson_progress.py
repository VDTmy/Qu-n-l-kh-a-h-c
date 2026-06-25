# MỤC ĐÍCH:
# Schema này dùng để nhận và trả dữ liệu tiến độ học bài.

from pydantic import BaseModel


class LessonProgressUpdate(BaseModel):
    is_completed: bool = True
    watched_seconds: int = 0


class LessonProgressResponse(BaseModel):
    id: int
    student_id: int
    lesson_id: int
    is_completed: bool
    watched_seconds: int

    class Config:
        from_attributes = True