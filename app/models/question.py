# MỤC ĐÍCH:
# Model này tạo bảng questions.
# Mỗi exam có nhiều câu hỏi.
# Hiện tại ta làm dạng trắc nghiệm một đáp án đúng.

from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base


class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)

    exam_id = Column(
        Integer,
        ForeignKey("exams.id"),
        nullable=False
    )

    content = Column(Text, nullable=False)

    question_type = Column(String(50), default="single_choice")
    # single_choice / multiple_choice

    score = Column(Integer, default=1)

    exam = relationship("Exam")