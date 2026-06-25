from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db

from app.models.user import User
from app.models.teacher import TeacherProfile
from app.models.course import Course
from app.models.enrollment import Enrollment
from app.models.exam import Exam

from app.schemas.teacher import TeacherProfileCreate, TeacherProfileResponse

from app.core.deps import require_teacher
from app.core.deps import require_approved_teacher

from fastapi import UploadFile, File
import shutil
import os


router = APIRouter(
    prefix="/teachers",
    tags=["Teachers"]
)


@router.post(
    "/profile",
    response_model=TeacherProfileResponse
)
def create_teacher_profile(
    profile_data: TeacherProfileCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_teacher)
):
    existing_profile = (
        db.query(TeacherProfile)
        .filter(TeacherProfile.user_id == current_user.id)
        .first()
    )

    if existing_profile:
        raise HTTPException(
            status_code=400,
            detail="Giảng viên đã có hồ sơ"
        )

    new_profile = TeacherProfile(
        user_id=current_user.id,
        phone=profile_data.phone,
        expertise=profile_data.expertise,
        experience=profile_data.experience,
        bio=profile_data.bio,
        status="pending"
    )

    db.add(new_profile)
    db.commit()
    db.refresh(new_profile)

    return new_profile




@router.post("/profile/upload-cv")
def upload_cv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_teacher)
):
    profile = (
        db.query(TeacherProfile)
        .filter(TeacherProfile.user_id == current_user.id)
        .first()
    )

    if not profile:
        raise HTTPException(
            status_code=404,
            detail="Bạn cần tạo hồ sơ giảng viên trước"
        )

    upload_dir = "uploads/cv"
    os.makedirs(upload_dir, exist_ok=True)

    file_location = f"{upload_dir}/{current_user.id}_{file.filename}"

    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    profile.cv_file_url = (
    f"/uploads/cv/{current_user.id}_{file.filename}"
)

    db.commit()
    db.refresh(profile)

    return {
        "message": "Upload CV thành công",
        "cv_file_url": profile.cv_file_url,
        "status": profile.status
    }

# MỤC ĐÍCH:
# API này cho giảng viên xem tất cả khóa học do chính mình tạo.
# Dùng cho màn Teacher Dashboard → Khóa học của tôi.

@router.get("/me/courses")
def get_my_teacher_courses(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_approved_teacher)
):
    courses = (
        db.query(Course)
        .filter(Course.teacher_id == current_user.id)
        .all()
    )

    return courses



# MỤC ĐÍCH:
# API này cho giảng viên xem danh sách học sinh đã đăng ký một khóa học của mình.
# Điều kiện:
# - Khóa học phải tồn tại.
# - Khóa học phải thuộc về teacher đang đăng nhập.

@router.get("/me/courses/{course_id}/students")
def get_students_in_my_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_approved_teacher)
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

    if course.teacher_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Bạn không sở hữu khóa học này"
        )

    enrollments = (
        db.query(Enrollment)
        .filter(Enrollment.course_id == course_id)
        .all()
    )

    result = []

    for enrollment in enrollments:
        student = (
            db.query(User)
            .filter(User.id == enrollment.student_id)
            .first()
        )

        result.append({
            "id": enrollment.id,
            "student_id": enrollment.student_id,
            "course_id": enrollment.course_id,
            "status": enrollment.status,
            "progress_percent": enrollment.progress_percent,
            "created_at": None,
            "student": {
                "id": student.id,
                "full_name": student.full_name,
                "email": student.email,
                "role": student.role
            } if student else None
        })

    return result

# MỤC ĐÍCH:
# API này cho giảng viên xem tất cả đề thi mình đã tạo.
# Dùng cho màn Teacher Dashboard → Quản lý đề thi.

@router.get("/me/exams")
def get_my_teacher_exams(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_approved_teacher)
):
    exams = (
        db.query(Exam)
        .filter(Exam.teacher_id == current_user.id)
        .all()
    )

    return exams



# MỤC ĐÍCH:
# API này trả số liệu tổng quan cho dashboard giảng viên:
# - Tổng khóa học
# - Khóa học đã duyệt
# - Khóa học chờ duyệt
# - Tổng học sinh đăng ký
# - Tổng đề thi

@router.get("/me/statistics")
def get_teacher_statistics(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_approved_teacher)
):
    total_courses = (
        db.query(Course)
        .filter(Course.teacher_id == current_user.id)
        .count()
    )

    approved_courses = (
        db.query(Course)
        .filter(
            Course.teacher_id == current_user.id,
            Course.status == "approved"
        )
        .count()
    )

    pending_courses = (
        db.query(Course)
        .filter(
            Course.teacher_id == current_user.id,
            Course.status == "pending"
        )
        .count()
    )

    teacher_courses = (
        db.query(Course)
        .filter(Course.teacher_id == current_user.id)
        .all()
    )

    course_ids = [
        course.id for course in teacher_courses
    ]

    total_students = 0

    if course_ids:
        total_students = (
            db.query(Enrollment)
            .filter(Enrollment.course_id.in_(course_ids))
            .count()
        )

    total_exams = (
        db.query(Exam)
        .filter(Exam.teacher_id == current_user.id)
        .count()
    )

    return {
        "courses": {
            "total": total_courses,
            "approved": approved_courses,
            "pending": pending_courses
        },
        "students": {
            "total_enrollments": total_students
        },
        "exams": {
            "total": total_exams
        }
    }

# MỤC ĐÍCH:
# API này lấy hồ sơ giảng viên của tài khoản teacher đang đăng nhập.
# Frontend dùng để kiểm tra teacher đã tạo hồ sơ chưa,
# hồ sơ đang pending, rejected hay approved.

@router.get("/me/profile")
def get_my_teacher_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_teacher)
):
    profile = (
        db.query(TeacherProfile)
        .filter(
            TeacherProfile.user_id == current_user.id
        )
        .first()
    )

    if not profile:
        raise HTTPException(
            status_code=404,
            detail="Giảng viên chưa có hồ sơ"
        )

    return profile