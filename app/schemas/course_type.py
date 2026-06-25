# MỤC ĐÍCH:
# Schema tạo và trả dữ liệu loại khóa học.

from pydantic import BaseModel


class CourseTypeCreate(BaseModel):

    name: str

    requires_grade: bool


class CourseTypeResponse(BaseModel):

    id: int

    name: str

    requires_grade: bool

    class Config:
        from_attributes = True