# MỤC ĐÍCH:
# Model này tạo bảng student_answers.
# Bảng này lưu từng đáp án mà học sinh đã chọn trong một lần làm bài.

from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base


class StudentAnswer(Base):
    __tablename__ = "student_answers"

    id = Column(Integer, primary_key=True, index=True)

    attempt_id = Column(
        Integer,
        ForeignKey("exam_attempts.id"),
        nullable=False
    )

    question_id = Column(
        Integer,
        ForeignKey("questions.id"),
        nullable=False
    )

    answer_id = Column(
        Integer,
        ForeignKey("answers.id"),
        nullable=False
    )

    attempt = relationship("ExamAttempt")

    question = relationship("Question")

    answer = relationship("Answer")