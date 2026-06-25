# MỤC ĐÍCH:
# Model này tạo bảng answers.
# Mỗi câu hỏi có nhiều đáp án.
# is_correct = True nghĩa là đáp án đúng.

from sqlalchemy import Column, Integer, Text, Boolean, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base


class Answer(Base):
    __tablename__ = "answers"

    id = Column(Integer, primary_key=True, index=True)

    question_id = Column(
        Integer,
        ForeignKey("questions.id"),
        nullable=False
    )

    content = Column(Text, nullable=False)

    is_correct = Column(Boolean, default=False)

    question = relationship("Question")