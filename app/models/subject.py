# MỤC ĐÍCH:
# Model này tạo bảng subjects để lưu danh sách môn học như Toán, Văn, Anh, Lý, Hóa.

from sqlalchemy import Column, Integer, String

from app.database import Base


class Subject(Base):
    __tablename__ = "subjects"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String(100), unique=True, nullable=False)

    description = Column(String(255), nullable=True)