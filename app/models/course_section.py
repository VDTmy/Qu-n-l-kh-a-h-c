# MỤC ĐÍCH:
# Model này tạo bảng course_sections.
# Một khóa học có nhiều chương/phần học.
# Ví dụ: Khóa Toán 12 có chương Hàm số, Logarit, Tích phân.

from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base


class CourseSection(Base):
    __tablename__ = "course_sections"

    id = Column(Integer, primary_key=True, index=True)

    course_id = Column(
        Integer,
        ForeignKey("courses.id"),
        nullable=False
    )

    title = Column(String(255), nullable=False)

    order_index = Column(Integer, default=1)

    course = relationship("Course")