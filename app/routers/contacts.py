# MỤC ĐÍCH:
# Router này xử lý form Liên hệ.
# Người dùng gửi liên hệ.
# Admin xem và xử lý liên hệ.

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db

from app.models.contact import Contact
from app.models.user import User

from app.schemas.contact import ContactCreate, ContactResponse

from app.core.deps import require_admin


router = APIRouter(
    prefix="/contacts",
    tags=["Contacts"]
)

# MỤC ĐÍCH:
# API này cho phép khách/người dùng gửi form liên hệ.
# Không yêu cầu đăng nhập vì khách truy cập cũng có thể gửi liên hệ.

@router.post(
    "/",
    response_model=ContactResponse
)
def create_contact(
    data: ContactCreate,
    db: Session = Depends(get_db)
):
    contact = Contact(
        full_name=data.full_name,
        email=data.email,
        phone=data.phone,
        message=data.message,
        status="new"
    )

    db.add(contact)
    db.commit()
    db.refresh(contact)

    return contact

# MỤC ĐÍCH:
# API này cho Admin xem tất cả liên hệ từ người dùng.
# Dùng cho màn Admin Dashboard → Quản lý liên hệ.

@router.get(
    "/",
    response_model=list[ContactResponse]
)
def get_contacts(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    contacts = db.query(Contact).all()

    return contacts

# MỤC ĐÍCH:
# API này cho Admin đánh dấu một liên hệ là đã xử lý.
# status chuyển từ "new" sang "processed".

@router.patch("/{contact_id}/process")
def process_contact(
    contact_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    contact = (
        db.query(Contact)
        .filter(Contact.id == contact_id)
        .first()
    )

    if not contact:
        raise HTTPException(
            status_code=404,
            detail="Không tìm thấy liên hệ"
        )

    contact.status = "processed"

    db.commit()
    db.refresh(contact)

    return {
        "message": "Đã xử lý liên hệ",
        "contact_id": contact.id,
        "status": contact.status
    }