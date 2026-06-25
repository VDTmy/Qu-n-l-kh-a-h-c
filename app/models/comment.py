# MỤC ĐÍCH:
# Model này tạo bảng comments.
# Bảng này lưu bình luận/hỏi đáp của học sinh và phản hồi của giảng viên.
# parent_id dùng để tạo dạng trả lời bình luận.
# Ví dụ:
# - Student hỏi: Em chưa hiểu bài này.
# - Teacher reply: Em xem lại phút thứ 10 nhé.

from sqlalchemy import Column, Integer, Text, Boolean, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base


class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)

    course_id = Column(
        Integer,
        ForeignKey("courses.id"),
        nullable=False
    )

    lesson_id = Column(
        Integer,
        ForeignKey("lessons.id"),
        nullable=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    parent_id = Column(
        Integer,
        ForeignKey("comments.id"),
        nullable=True
    )

    content = Column(Text, nullable=False)

    is_pinned = Column(Boolean, default=False)

    is_deleted = Column(Boolean, default=False)

    user = relationship("User")
    course = relationship("Course")
    lesson = relationship("Lesson")