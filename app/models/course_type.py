# MỤC ĐÍCH:
# Lưu loại khóa học.
# Dùng để quyết định khóa học có cần chọn lớp hay không.

from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import Boolean

from app.database import Base


class CourseType(Base):

    __tablename__ = "course_types"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    name = Column(
        String(100),
        unique=True,
        nullable=False
    )

    requires_grade = Column(
        Boolean,
        default=True
    )