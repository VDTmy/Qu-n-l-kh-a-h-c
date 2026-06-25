# MỤC ĐÍCH:
# Model này tạo bảng enrollments.
# Bảng này lưu việc học sinh đã đăng ký khóa học nào.
# Một học sinh có thể đăng ký nhiều khóa học.
# Một khóa học có thể có nhiều học sinh.

from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base


class Enrollment(Base):
    __tablename__ = "enrollments"

    id = Column(Integer, primary_key=True, index=True)

    student_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    course_id = Column(
        Integer,
        ForeignKey("courses.id"),
        nullable=False
    )

    status = Column(
        String(20),
        default="active"
    )
    # active / completed / cancelled

    progress_percent = Column(
        Float,
        default=0
    )

    student = relationship("User")

    course = relationship("Course")