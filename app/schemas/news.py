# MỤC ĐÍCH:
# Schema này dùng để tạo, sửa và trả dữ liệu tin tức.

from pydantic import BaseModel


class NewsCreate(BaseModel):
    title: str
    summary: str | None = None
    content: str
    category: str | None = None
    is_published: bool = True


class NewsUpdate(BaseModel):
    title: str | None = None
    summary: str | None = None
    content: str | None = None
    category: str | None = None
    is_published: bool | None = None


class NewsResponse(BaseModel):
    id: int
    title: str
    summary: str | None
    content: str
    thumbnail_url: str | None
    category: str | None
    is_published: bool
    author_id: int

    class Config:
        from_attributes = True