# MỤC ĐÍCH:
# Model này tạo bảng contacts.
# Bảng này lưu thông tin liên hệ/phản hồi từ người dùng trên trang Liên hệ.

from sqlalchemy import Column, Integer, String, Text

from app.database import Base


class Contact(Base):
    __tablename__ = "contacts"

    id = Column(Integer, primary_key=True, index=True)

    full_name = Column(String(100), nullable=False)

    email = Column(String(100), nullable=False)

    phone = Column(String(20), nullable=True)

    message = Column(Text, nullable=False)

    status = Column(String(20), default="new")
    # new / processed