from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base


class TeacherProfile(Base):
    __tablename__ = "teacher_profiles"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        unique=True,
        nullable=False
    )

    phone = Column(String(20), nullable=True)

    expertise = Column(String(255), nullable=True)

    experience = Column(String(255), nullable=True)

    bio = Column(Text, nullable=True)

    cv_file_url = Column(String(255), nullable=True)

    status = Column(String(20), default="pending")
    # pending / approved / rejected

    rejection_reason = Column(Text, nullable=True)

    user = relationship("User")