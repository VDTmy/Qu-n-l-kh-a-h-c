# MỤC ĐÍCH:
# Schema trả dữ liệu đăng ký khóa học cho frontend.

from pydantic import BaseModel


class EnrollmentResponse(BaseModel):
    id: int
    student_id: int
    course_id: int
    status: str
    progress_percent: float

    class Config:
        from_attributes = True