# MỤC ĐÍCH:
# Model này tạo bảng notifications.
# Bảng này lưu thông báo gửi tới user.
# Ví dụ:
# - Tài khoản giảng viên của bạn đã được duyệt.
# - Khóa học của bạn đã được admin duyệt.
# - Có học sinh mới đăng ký khóa học của bạn.

from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    title = Column(String(255), nullable=False)

    message = Column(Text, nullable=False)

    type = Column(String(50), nullable=True)
    # teacher_approved / course_approved / enrollment / comment

    is_read = Column(Boolean, default=False)

    user = relationship("User")