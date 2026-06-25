# MỤC ĐÍCH:
# Model này tạo bảng exams.
# Bảng exams lưu thông tin bài kiểm tra / đề thi trong một khóa học.
# Ví dụ: Kiểm tra chương 1, Đề luyện thi THPT, Bài test cuối khóa.

from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base


class Exam(Base):
    __tablename__ = "exams"

    id = Column(Integer, primary_key=True, index=True)

    course_id = Column(
        Integer,
        ForeignKey("courses.id"),
        nullable=False
    )

    teacher_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    title = Column(String(255), nullable=False)

    description = Column(Text, nullable=True)

    duration_minutes = Column(Integer, default=45)

    total_score = Column(Integer, default=10)

    status = Column(String(20), default="active")
    # active / inactive

    course = relationship("Course")
    teacher = relationship("User")