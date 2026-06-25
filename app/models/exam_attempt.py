from sqlalchemy import Column, Integer, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime

from app.database import Base


class ExamAttempt(Base):
    __tablename__ = "exam_attempts"

    id = Column(Integer, primary_key=True, index=True)

    exam_id = Column(Integer, ForeignKey("exams.id"), nullable=False)

    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    score = Column(Float, default=0)

    submitted_at = Column(DateTime, default=datetime.utcnow)

    exam = relationship("Exam")

    student = relationship("User")