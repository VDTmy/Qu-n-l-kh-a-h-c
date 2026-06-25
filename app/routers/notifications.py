# MỤC ĐÍCH:
# Router này xử lý thông báo của người dùng:
# - Xem thông báo của tôi
# - Đếm thông báo chưa đọc
# - Đánh dấu đã đọc

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db

from app.models.user import User
from app.models.notification import Notification

from app.schemas.notification import NotificationResponse

from app.core.deps import get_current_user


router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"]
)


# MỤC ĐÍCH:
# API này trả về danh sách thông báo của user đang đăng nhập.
# Frontend dùng cho icon chuông thông báo.

@router.get(
    "/me",
    response_model=list[NotificationResponse]
)
def get_my_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    notifications = (
        db.query(Notification)
        .filter(Notification.user_id == current_user.id)
        .order_by(Notification.id.desc())
        .all()
    )

    return notifications


# MỤC ĐÍCH:
# API này trả về số lượng thông báo chưa đọc.
# Frontend dùng để hiển thị badge đỏ trên icon chuông.

@router.get("/me/unread-count")
def get_unread_notification_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    count = (
        db.query(Notification)
        .filter(
            Notification.user_id == current_user.id,
            Notification.is_read == False
        )
        .count()
    )

    return {
        "unread_count": count
    }


# MỤC ĐÍCH:
# API này đánh dấu một thông báo là đã đọc.

@router.patch("/{notification_id}/read")
def mark_notification_as_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    notification = (
        db.query(Notification)
        .filter(
            Notification.id == notification_id,
            Notification.user_id == current_user.id
        )
        .first()
    )

    if not notification:
        raise HTTPException(
            status_code=404,
            detail="Không tìm thấy thông báo"
        )

    notification.is_read = True

    db.commit()
    db.refresh(notification)

    return {
        "message": "Đã đánh dấu thông báo là đã đọc",
        "notification_id": notification.id,
        "is_read": notification.is_read
    }