from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer

from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.teacher import TeacherProfile
from app.core.security import decode_access_token


oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/auth/login"
)


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    payload = decode_access_token(token)

    if payload is None:
        raise HTTPException(
            status_code=401,
            detail="Token không hợp lệ"
        )

    user_id = payload.get("user_id")

    if user_id is None:
        raise HTTPException(
            status_code=401,
            detail="Token không hợp lệ"
        )

    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if user is None:
        raise HTTPException(
            status_code=401,
            detail="Người dùng không tồn tại"
        )

    return user



def require_admin(
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Bạn không có quyền Admin"
        )

    return current_user


def require_teacher(
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "teacher":
        raise HTTPException(
            status_code=403,
            detail="Bạn không có quyền Giảng viên"
        )

    return current_user


def require_student(
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "student":
        raise HTTPException(
            status_code=403,
            detail="Bạn không có quyền Học sinh"
        )

    return current_user

# MỤC ĐÍCH:
# Chỉ cho phép giảng viên đã được admin duyệt sử dụng chức năng của giảng viên.
# Điều kiện đúng:
# 1. User phải có role = "teacher"
# 2. User phải có hồ sơ trong bảng teacher_profiles
# 3. Hồ sơ đó phải có status = "approved"

def require_approved_teacher(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "teacher":
        raise HTTPException(
            status_code=403,
            detail="Bạn không có quyền Giảng viên"
        )

    teacher_profile = (
        db.query(TeacherProfile)
        .filter(TeacherProfile.user_id == current_user.id)
        .first()
    )

    if not teacher_profile:
        raise HTTPException(
            status_code=403,
            detail="Bạn chưa tạo hồ sơ giảng viên"
        )

    if teacher_profile.status != "approved":
        raise HTTPException(
            status_code=403,
            detail="Tài khoản giảng viên chưa được admin duyệt"
        )

    return current_user