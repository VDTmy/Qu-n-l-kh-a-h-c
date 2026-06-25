# MỤC ĐÍCH:
# Router này xử lý bình luận/hỏi đáp dưới khóa học hoặc bài học.
# Student có thể hỏi.
# Teacher có thể trả lời nếu sở hữu khóa học.
# Admin có thể quản lý sau.

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db

from app.models.user import User
from app.models.course import Course
from app.models.lesson import Lesson
from app.models.course_section import CourseSection
from app.models.enrollment import Enrollment
from app.models.comment import Comment
from app.models.notification import Notification

from app.schemas.comment import CommentCreate, CommentResponse

from app.core.deps import get_current_user


router = APIRouter(
    prefix="/comments",
    tags=["Comments"]
)


# MỤC ĐÍCH:
# API này cho user đã đăng nhập tạo bình luận.
# Logic:
# - Student chỉ được bình luận nếu đã đăng ký khóa học.
# - Teacher chỉ được bình luận/trả lời trong khóa học của mình.
# - Admin được bình luận nếu cần quản lý/hỗ trợ.

@router.post(
    "/",
    response_model=CommentResponse
)
def create_comment(
    data: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    course = (
        db.query(Course)
        .filter(Course.id == data.course_id)
        .first()
    )

    if not course:
        raise HTTPException(
            status_code=404,
            detail="Không tìm thấy khóa học"
        )

    if data.lesson_id is not None:
        lesson = (
            db.query(Lesson)
            .filter(Lesson.id == data.lesson_id)
            .first()
        )

        if not lesson:
            raise HTTPException(
                status_code=404,
                detail="Không tìm thấy bài học"
            )

        section = (
            db.query(CourseSection)
            .filter(CourseSection.id == lesson.section_id)
            .first()
        )

        if section.course_id != data.course_id:
            raise HTTPException(
                status_code=400,
                detail="Bài học không thuộc khóa học này"
            )

    if current_user.role == "student":
        enrollment = (
            db.query(Enrollment)
            .filter(
                Enrollment.student_id == current_user.id,
                Enrollment.course_id == data.course_id
            )
            .first()
        )

        if not enrollment:
            raise HTTPException(
                status_code=403,
                detail="Bạn chưa đăng ký khóa học này"
            )

    elif current_user.role == "teacher":
        if course.teacher_id != current_user.id:
            raise HTTPException(
                status_code=403,
                detail="Bạn không được bình luận trong khóa học của giảng viên khác"
            )

    elif current_user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Bạn không có quyền bình luận"
        )

    if data.parent_id is not None:
        parent_comment = (
            db.query(Comment)
            .filter(Comment.id == data.parent_id)
            .first()
        )

        if not parent_comment:
            raise HTTPException(
                status_code=404,
                detail="Không tìm thấy bình luận cha"
            )

    comment = Comment(
        course_id=data.course_id,
        lesson_id=data.lesson_id,
        user_id=current_user.id,
        parent_id=data.parent_id,
        content=data.content
    )

    db.add(comment)
    db.commit()
    db.refresh(comment)

    if data.parent_id is not None:
        parent_comment = (
            db.query(Comment)
            .filter(Comment.id == data.parent_id)
            .first()
        )

        if parent_comment and parent_comment.user_id != current_user.id:
            notification = Notification(
                user_id=parent_comment.user_id,
                title="Bình luận của bạn có phản hồi mới",
                message=f"{current_user.full_name} đã trả lời bình luận của bạn.",
                type="comment_reply"
         )

        db.add(notification)
        db.commit()

    return comment


# MỤC ĐÍCH:
# API này lấy danh sách bình luận của một bài học.
# Frontend màn LessonPlayer sẽ gọi API này.

@router.get(
    "/lessons/{lesson_id}",
    response_model=list[CommentResponse]
)
def get_comments_by_lesson(
    lesson_id: int,
    db: Session = Depends(get_db)
):
    comments = (
        db.query(Comment)
        .filter(
            Comment.lesson_id == lesson_id,
            Comment.is_deleted == False
        )
        .all()
    )

    return comments


# MỤC ĐÍCH:
# Lấy bình luận theo khóa học.
# Frontend trang CourseDetail gọi API này.

@router.get("/courses/{course_id}")
def get_comments_by_course(
    course_id: int,
    db: Session = Depends(get_db)
):
    comments = (
        db.query(Comment)
        .filter(
            Comment.course_id == course_id,
            Comment.is_deleted == False
        )
        .all()
    )

    return comments