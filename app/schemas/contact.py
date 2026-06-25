# MỤC ĐÍCH:
# Schema này dùng cho form Liên hệ và dữ liệu trả về cho Admin.

from pydantic import BaseModel, EmailStr


class ContactCreate(BaseModel):
    full_name: str
    email: EmailStr
    phone: str | None = None
    message: str


class ContactResponse(BaseModel):
    id: int
    full_name: str
    email: str
    phone: str | None
    message: str
    status: str

    class Config:
        from_attributes = True