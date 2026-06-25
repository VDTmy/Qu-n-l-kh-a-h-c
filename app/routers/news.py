# MỤC ĐÍCH:
# Router này xử lý tin tức:
# - Admin tạo/sửa/xóa tin tức
# - Người dùng xem danh sách tin tức
# - Người dùng xem chi tiết tin tức

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db

from app.models.user import User
from app.models.news import News

from app.schemas.news import NewsCreate, NewsUpdate, NewsResponse

from app.core.deps import require_admin


router = APIRouter(
    prefix="/news",
    tags=["News"]
)

# MỤC ĐÍCH:
# API này cho Admin tạo bài viết tin tức mới.
# Tin tức có thể hiển thị ở trang chủ hoặc trang Tin tức.

@router.post(
    "/",
    response_model=NewsResponse
)
def create_news(
    data: NewsCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    news = News(
        title=data.title,
        summary=data.summary,
        content=data.content,
        category=data.category,
        is_published=data.is_published,
        author_id=current_user.id
    )

    db.add(news)
    db.commit()
    db.refresh(news)

    return news

# MỤC ĐÍCH:
# API này trả về danh sách tin tức đã xuất bản.
# Frontend trang Tin tức và Trang chủ sẽ gọi API này.

@router.get(
    "/",
    response_model=list[NewsResponse]
)
def get_news_list(
    db: Session = Depends(get_db)
):
    news_list = (
        db.query(News)
        .filter(News.is_published == True)
        .all()
    )

    return news_list

# MỤC ĐÍCH:
# API này trả về chi tiết một bài viết tin tức.
# Frontend dùng cho trang Chi tiết tin tức.

@router.get(
    "/{news_id}",
    response_model=NewsResponse
)
def get_news_detail(
    news_id: int,
    db: Session = Depends(get_db)
):
    news = (
        db.query(News)
        .filter(
            News.id == news_id,
            News.is_published == True
        )
        .first()
    )

    if not news:
        raise HTTPException(
            status_code=404,
            detail="Không tìm thấy tin tức"
        )

    return news

# MỤC ĐÍCH:
# API này cho Admin cập nhật nội dung tin tức.
# Chỉ cập nhật trường nào được gửi lên.

@router.patch(
    "/{news_id}",
    response_model=NewsResponse
)
def update_news(
    news_id: int,
    data: NewsUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    news = (
        db.query(News)
        .filter(News.id == news_id)
        .first()
    )

    if not news:
        raise HTTPException(
            status_code=404,
            detail="Không tìm thấy tin tức"
        )

    if data.title is not None:
        news.title = data.title

    if data.summary is not None:
        news.summary = data.summary

    if data.content is not None:
        news.content = data.content

    if data.category is not None:
        news.category = data.category

    if data.is_published is not None:
        news.is_published = data.is_published

    db.commit()
    db.refresh(news)

    return news

# MỤC ĐÍCH:
# API này cho Admin ẩn tin tức khỏi giao diện người dùng.
# Không xóa khỏi database, chỉ đổi is_published = False.

@router.patch("/{news_id}/hide")
def hide_news(
    news_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    news = (
        db.query(News)
        .filter(News.id == news_id)
        .first()
    )

    if not news:
        raise HTTPException(
            status_code=404,
            detail="Không tìm thấy tin tức"
        )

    news.is_published = False

    db.commit()
    db.refresh(news)

    return {
        "message": "Ẩn tin tức thành công",
        "news_id": news.id,
        "is_published": news.is_published
    }