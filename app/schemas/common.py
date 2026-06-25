# MỤC ĐÍCH:
# Schema này dùng cho Subject và Grade.
# Admin dùng để thêm môn học/lớp học, frontend dùng để nhận dữ liệu trả về.

from pydantic import BaseModel


class SubjectCreate(BaseModel):
    name: str
    description: str | None = None


class SubjectResponse(BaseModel):
    id: int
    name: str
    description: str | None

    class Config:
        from_attributes = True


class GradeCreate(BaseModel):
    name: str


class GradeResponse(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True