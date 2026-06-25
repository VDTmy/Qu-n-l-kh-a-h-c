# MỤC ĐÍCH:
# Model này tạo bảng lesson_progress.
# Bảng này lưu tiến độ học từng bài của học sinh.
# Ví dụ: học sinh A đã hoàn thành bài 1, bài 2 trong khóa học.

from sqlalchemy import Column, Integer, Boolean, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base


class LessonProgress(Base):
    __tablename__ = "lesson_progress"

    id = Column(Integer, primary_key=True, index=True)

    student_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    lesson_id = Column(
        Integer,
        ForeignKey("lessons.id"),
        nullable=False
    )

    is_completed = Column(
        Boolean,
        default=False
    )

    watched_seconds = Column(
        Integer,
        default=0
    )

    student = relationship("User")

    lesson = relationship("Lesson")