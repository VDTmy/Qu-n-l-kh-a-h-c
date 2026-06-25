# MỤC ĐÍCH:
# Model này tạo bảng courses.
# Bảng courses lưu thông tin khóa học do giảng viên tạo.
# Khóa học ban đầu có status = "pending" để admin duyệt.

from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import Text
from sqlalchemy import Float
from sqlalchemy import ForeignKey

from sqlalchemy.orm import relationship

from app.database import Base


class Course(Base):

    __tablename__ = "courses"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    title = Column(
        String(255),
        nullable=False
    )

    short_description = Column(
        String(500),
        nullable=True
    )

    full_description = Column(
        Text,
        nullable=True
    )

    price = Column(
        Float,
        default=0
    )

    thumbnail_url = Column(
        String(255),
        nullable=True
    )

    level = Column(
        String(50),
        nullable=True
    )

    status = Column(
        String(20),
        default="pending"
    )
    # pending / approved / rejected

    rejection_reason = Column(
        Text,
        nullable=True
    )

    teacher_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    subject_id = Column(
        Integer,
        ForeignKey("subjects.id"),
        nullable=False
    )

    grade_id = Column(
        Integer,
        ForeignKey("grades.id"),
        nullable=True
    )

    course_type_id = Column(
        Integer,
        ForeignKey("course_types.id"),
        nullable=False
    )

    teacher = relationship("User")
    subject = relationship("Subject")
    grade = relationship("Grade")
    course_type = relationship("CourseType")