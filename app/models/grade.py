# MỤC ĐÍCH:
# Model này tạo bảng grades để lưu danh sách lớp học như lớp 6, lớp 7, lớp 12.

from sqlalchemy import Column, Integer, String

from app.database import Base


class Grade(Base):
    __tablename__ = "grades"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String(50), unique=True, nullable=False)