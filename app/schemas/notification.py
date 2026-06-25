# MỤC ĐÍCH:
# Schema trả dữ liệu thông báo cho frontend.

from pydantic import BaseModel


class NotificationResponse(BaseModel):
    id: int
    user_id: int
    title: str
    message: str
    type: str | None
    is_read: bool

    class Config:
        from_attributes = True