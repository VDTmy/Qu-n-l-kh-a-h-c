# MỤC ĐÍCH:
# Router này xử lý chứng chỉ hoàn thành khóa học.
# Học sinh chỉ được nhận chứng chỉ khi progress_percent = 100.

from fastapi import APIRouter, Depends, HTTPException

from sqlalchemy.orm import Session

from uuid import uuid4

from app.database import get_db

from app.models.user import User
from app.models.course import Course
from app.models.enrollment import Enrollment
from app.models.certificate import Certificate
from fastapi.responses import FileResponse
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
import os

from app.core.deps import require_student


router = APIRouter(
    prefix="/certificates",
    tags=["Certificates"]
)


# MỤC ĐÍCH:
# API này cấp chứng chỉ cho học sinh khi đã hoàn thành 100% khóa học.

@router.post("/courses/{course_id}/generate")
def generate_certificate(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_student)
):
    course = (
        db.query(Course)
        .filter(Course.id == course_id)
        .first()
    )

    if not course:
        raise HTTPException(
            status_code=404,
            detail="Không tìm thấy khóa học"
        )

    enrollment = (
        db.query(Enrollment)
        .filter(
            Enrollment.student_id == current_user.id,
            Enrollment.course_id == course_id
        )
        .first()
    )

    if not enrollment:
        raise HTTPException(
            status_code=404,
            detail="Bạn chưa đăng ký khóa học này"
        )

    if enrollment.progress_percent < 100:
        raise HTTPException(
            status_code=400,
            detail="Bạn chưa hoàn thành 100% khóa học"
        )

    existing_certificate = (
        db.query(Certificate)
        .filter(
            Certificate.student_id == current_user.id,
            Certificate.course_id == course_id
        )
        .first()
    )

    if existing_certificate:
        return existing_certificate

    certificate = Certificate(
        student_id=current_user.id,
        course_id=course_id,
        certificate_code=str(uuid4())
    )

    db.add(certificate)
    db.commit()
    db.refresh(certificate)

    return certificate


# MỤC ĐÍCH:
# API này trả về danh sách chứng chỉ của học sinh đang đăng nhập.

@router.get("/me")
def get_my_certificates(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_student)
):
    certificates = (
        db.query(Certificate)
        .filter(Certificate.student_id == current_user.id)
        .all()
    )

    result = []

    for certificate in certificates:
        course = (
            db.query(Course)
            .filter(Course.id == certificate.course_id)
            .first()
        )

        teacher = None

        if course:
            teacher = (
                db.query(User)
                .filter(User.id == course.teacher_id)
                .first()
            )

        result.append({
            "id": certificate.id,
            "student_id": certificate.student_id,
            "course_id": certificate.course_id,
            "certificate_code": certificate.certificate_code,
            "course": {
                "id": course.id,
                "title": course.title,
                "teacher": {
                    "id": teacher.id,
                    "full_name": teacher.full_name,
                    "email": teacher.email
                } if teacher else None
            } if course else None
        })

    return result

@router.get("/{certificate_id}/download")
def download_certificate(
    certificate_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_student)
):
    certificate = (
        db.query(Certificate)
        .filter(
            Certificate.id == certificate_id,
            Certificate.student_id == current_user.id
        )
        .first()
    )

    if not certificate:
        raise HTTPException(status_code=404, detail="Không tìm thấy chứng chỉ")

    course = db.query(Course).filter(Course.id == certificate.course_id).first()

    os.makedirs("uploads/certificates", exist_ok=True)

    file_path = f"uploads/certificates/certificate_{certificate.id}.pdf"

    c = canvas.Canvas(file_path, pagesize=A4)
    width, height = A4

    c.setFont("Helvetica-Bold", 28)
    c.drawCentredString(width / 2, height - 120, "EDUMASTER CERTIFICATE")

    c.setFont("Helvetica", 16)
    c.drawCentredString(width / 2, height - 180, "Chứng nhận hoàn thành khóa học")

    c.setFont("Helvetica-Bold", 22)
    c.drawCentredString(width / 2, height - 240, current_user.full_name)

    c.setFont("Helvetica", 15)
    c.drawCentredString(width / 2, height - 290, "đã hoàn thành khóa học")

    c.setFont("Helvetica-Bold", 20)
    c.drawCentredString(width / 2, height - 330, course.title if course else f"Khóa học #{certificate.course_id}")

    c.setFont("Helvetica", 11)
    c.drawCentredString(width / 2, height - 410, f"Mã chứng chỉ: {certificate.certificate_code}")

    c.setFont("Helvetica", 11)
    c.drawCentredString(width / 2, height - 440, "EduMaster Online Learning Platform")

    c.save()

    return FileResponse(
        file_path,
        media_type="application/pdf",
        filename=f"certificate_{certificate.id}.pdf"
    )