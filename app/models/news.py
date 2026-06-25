# MỤC ĐÍCH:
# Model này tạo bảng news.
# Bảng này lưu tin tức/bài viết do Admin đăng.
# Tin tức sẽ hiển thị ở trang chủ và trang Tin tức.

from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base


class News(Base):
    __tablename__ = "news"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(String(255), nullable=False)

    summary = Column(String(500), nullable=True)

    content = Column(Text, nullable=False)

    thumbnail_url = Column(String(255), nullable=True)

    category = Column(String(100), nullable=True)

    is_published = Column(Boolean, default=True)

    author_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    author = relationship("User")