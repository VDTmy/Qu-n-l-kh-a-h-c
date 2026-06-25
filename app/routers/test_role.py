from fastapi import APIRouter, Depends

from app.models.user import User
from app.core.deps import require_admin
from app.core.deps import require_teacher
from app.core.deps import require_student


router = APIRouter(
    prefix="/test-role",
    tags=["Test Role"]
)


@router.get("/admin")
def test_admin(
    current_user: User = Depends(require_admin)
):
    return {
        "message": "Bạn đang truy cập API của Admin",
        "user": current_user.email,
        "role": current_user.role
    }


@router.get("/teacher")
def test_teacher(
    current_user: User = Depends(require_teacher)
):
    return {
        "message": "Bạn đang truy cập API của Giảng viên",
        "user": current_user.email,
        "role": current_user.role
    }


@router.get("/student")
def test_student(
    current_user: User = Depends(require_student)
):
    return {
        "message": "Bạn đang truy cập API của Học sinh",
        "user": current_user.email,
        "role": current_user.role
    }