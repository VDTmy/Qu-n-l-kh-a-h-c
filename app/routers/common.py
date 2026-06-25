# MỤC ĐÍCH:
# Router này quản lý API môn học và lớp học.
# Admin được thêm môn/lớp, còn học sinh/khách có thể xem danh sách để lọc khóa học.

from fastapi import APIRouter, Depends, HTTPException

from sqlalchemy.orm import Session

from app.database import get_db
from app.models.subject import Subject
from app.models.grade import Grade
from app.models.user import User
from app.schemas.common import SubjectCreate, SubjectResponse
from app.schemas.common import GradeCreate, GradeResponse
from app.core.deps import require_admin


router = APIRouter(
    prefix="/common",
    tags=["Common"]
)


@router.post("/subjects", response_model=SubjectResponse)
def create_subject(
    subject_data: SubjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    existing_subject = (
        db.query(Subject)
        .filter(Subject.name == subject_data.name)
        .first()
    )

    if existing_subject:
        raise HTTPException(
            status_code=400,
            detail="Môn học đã tồn tại"
        )

    subject = Subject(
        name=subject_data.name,
        description=subject_data.description
    )

    db.add(subject)
    db.commit()
    db.refresh(subject)

    return subject


@router.get("/subjects", response_model=list[SubjectResponse])
def get_subjects(
    db: Session = Depends(get_db)
):
    return db.query(Subject).all()


@router.post("/grades", response_model=GradeResponse)
def create_grade(
    grade_data: GradeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    existing_grade = (
        db.query(Grade)
        .filter(Grade.name == grade_data.name)
        .first()
    )

    if existing_grade:
        raise HTTPException(
            status_code=400,
            detail="Lớp học đã tồn tại"
        )

    grade = Grade(
        name=grade_data.name
    )

    db.add(grade)
    db.commit()
    db.refresh(grade)

    return grade


@router.get("/grades", response_model=list[GradeResponse])
def get_grades(
    db: Session = Depends(get_db)
):
    return db.query(Grade).all()