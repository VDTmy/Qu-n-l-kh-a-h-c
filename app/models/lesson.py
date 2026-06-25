# MỤC ĐÍCH:
# Model này tạo bảng lessons.
# Một section/chương có nhiều bài học.
# Bài học có thể có video, tài liệu, nội dung mô tả.

from sqlalchemy import Column, Integer, String, Text, ForeignKey, Boolean
from sqlalchemy.orm import relationship

from app.database import Base


class Lesson(Base):
    __tablename__ = "lessons"

    id = Column(Integer, primary_key=True, index=True)

    section_id = Column(
        Integer,
        ForeignKey("course_sections.id"),
        nullable=False
    )

    title = Column(String(255), nullable=False)

    content = Column(Text, nullable=True)

    video_url = Column(String(255), nullable=True)

    document_url = Column(String(255), nullable=True)

    duration_minutes = Column(Integer, default=0)

    order_index = Column(Integer, default=1)

    is_free = Column(Boolean, default=False)

    section = relationship("CourseSection")