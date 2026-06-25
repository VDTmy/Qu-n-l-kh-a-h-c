# MỤC ĐÍCH:
# Router này xử lý:
# - Teacher tạo đề thi
# - Teacher tạo câu hỏi
# - Teacher tạo đáp án
# - Student xem đề thi sau này

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db

from app.models.user import User
from app.models.course import Course
from app.models.exam import Exam
from app.models.question import Question
from app.models.answer import Answer
from app.models.enrollment import Enrollment
from app.models.exam_attempt import ExamAttempt
from app.models.student_answer import StudentAnswer

from app.schemas.exam import ExamCreate, ExamResponse
from app.schemas.exam import QuestionCreate, QuestionResponse
from app.schemas.exam import AnswerCreate, AnswerResponse
from app.schemas.exam import SubmitExamRequest
from app.schemas.exam import SubmitExamResponse

from app.core.deps import require_approved_teacher
from app.core.deps import require_student

from app.models.question import Question
from app.models.exam_attempt import ExamAttempt
from app.models.answer import Answer
from app.models.enrollment import Enrollment
from app.core.deps import require_student

router = APIRouter(
    prefix="/exams",
    tags=["Exams"]
)

# MỤC ĐÍCH:
# API này cho giảng viên đã được duyệt tạo đề thi cho khóa học của mình.
# Điều kiện:
# - Course phải tồn tại.
# - Course phải thuộc về teacher đang đăng nhập.

@router.post(
    "/",
    response_model=ExamResponse
)
def create_exam(
    data: ExamCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_approved_teacher)
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

    if course.teacher_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Bạn không được tạo đề thi cho khóa học của giảng viên khác"
        )

    exam = Exam(
        course_id=data.course_id,
        teacher_id=current_user.id,
        title=data.title,
        description=data.description,
        duration_minutes=data.duration_minutes,
        total_score=data.total_score,
        status="active"
    )

    db.add(exam)
    db.commit()
    db.refresh(exam)

    return exam

# MỤC ĐÍCH:
# API này cho giảng viên thêm câu hỏi vào đề thi.
# Điều kiện:
# - Exam phải tồn tại.
# - Exam thuộc khóa học của teacher đang đăng nhập.

@router.post(
    "/questions",
    response_model=QuestionResponse
)
def create_question(
    data: QuestionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_approved_teacher)
):
    exam = (
        db.query(Exam)
        .filter(Exam.id == data.exam_id)
        .first()
    )

    if not exam:
        raise HTTPException(
            status_code=404,
            detail="Không tìm thấy đề thi"
        )

    course = (
        db.query(Course)
        .filter(Course.id == exam.course_id)
        .first()
    )

    if course.teacher_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Bạn không được thêm câu hỏi cho đề thi của giảng viên khác"
        )

    question = Question(
        exam_id=data.exam_id,
        content=data.content,
        question_type=data.question_type,
        score=data.score
    )

    db.add(question)
    db.commit()
    db.refresh(question)

    return question

# MỤC ĐÍCH:
# API này cho giảng viên thêm đáp án vào câu hỏi.
# Điều kiện:
# - Question phải tồn tại.
# - Question thuộc đề thi trong khóa học của teacher đang đăng nhập.

@router.post(
    "/answers",
    response_model=AnswerResponse
)
def create_answer(
    data: AnswerCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_approved_teacher)
):
    question = (
        db.query(Question)
        .filter(Question.id == data.question_id)
        .first()
    )

    if not question:
        raise HTTPException(
            status_code=404,
            detail="Không tìm thấy câu hỏi"
        )

    exam = (
        db.query(Exam)
        .filter(Exam.id == question.exam_id)
        .first()
    )

    course = (
        db.query(Course)
        .filter(Course.id == exam.course_id)
        .first()
    )

    if course.teacher_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Bạn không được thêm đáp án cho câu hỏi của giảng viên khác"
        )

    answer = Answer(
        question_id=data.question_id,
        content=data.content,
        is_correct=data.is_correct
    )

    db.add(answer)
    db.commit()
    db.refresh(answer)

    return answer


# MỤC ĐÍCH:
# API này cho học sinh xem danh sách đề thi của một khóa học.
# Điều kiện:
# - Học sinh phải đăng ký khóa học đó.
# - Chỉ trả về exam đang active.
@router.get("/course/{course_id}")
def get_exams_by_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_student)
):
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
            status_code=403,
            detail="Bạn chưa đăng ký khóa học này"
        )

    exams = (
        db.query(Exam)
        .filter(
            Exam.course_id == course_id,
            Exam.status == "active"
        )
        .all()
    )

    return exams\
    

@router.get("/teacher/course/{course_id}")
def get_teacher_exams_by_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_approved_teacher)
):
    course = db.query(Course).filter(Course.id == course_id).first()

    if not course:
        raise HTTPException(status_code=404, detail="Không tìm thấy khóa học")

    if course.teacher_id != current_user.id:
        raise HTTPException(status_code=403, detail="Bạn không sở hữu khóa học này")

    exams = (
        db.query(Exam)
        .filter(
            Exam.course_id == course_id,
            Exam.status == "active"
        )
        .all()
    )

    return exams




# MỤC ĐÍCH:
# API này trả về đề thi kèm câu hỏi và đáp án cho học sinh làm bài.
# Lưu ý:
# Không trả is_correct ra frontend để tránh lộ đáp án.

@router.get("/{exam_id}/detail")
def get_exam_detail(
    exam_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_student)
):
    exam = (
        db.query(Exam)
        .filter(Exam.id == exam_id)
        .first()
    )

    if not exam:
        raise HTTPException(
            status_code=404,
            detail="Không tìm thấy đề thi"
        )

    enrollment = (
        db.query(Enrollment)
        .filter(
            Enrollment.student_id == current_user.id,
            Enrollment.course_id == exam.course_id
        )
        .first()
    )

    if not enrollment:
        raise HTTPException(
            status_code=403,
            detail="Bạn chưa đăng ký khóa học này"
        )

    questions = (
        db.query(Question)
        .filter(Question.exam_id == exam_id)
        .all()
    )

    result_questions = []

    for question in questions:
        answers = (
            db.query(Answer)
            .filter(Answer.question_id == question.id)
            .all()
        )

        result_questions.append(
            {
                "id": question.id,
                "content": question.content,
                "question_type": question.question_type,
                "score": question.score,
                "answers": [
                    {
                        "id": answer.id,
                        "content": answer.content
                    }
                    for answer in answers
                ]
            }
        )

    return {
        "id": exam.id,
        "title": exam.title,
        "description": exam.description,
        "duration_minutes": exam.duration_minutes,
        "total_score": exam.total_score,
        "questions": result_questions
    }


# MỤC ĐÍCH:
# API này cho học sinh nộp bài thi.
# Backend sẽ tự kiểm tra đáp án đúng/sai và tính điểm.
# Sau đó lưu vào exam_attempts và student_answers.

@router.post(
    "/{exam_id}/submit",
    response_model=SubmitExamResponse
)
def submit_exam(
    exam_id: int,
    data: SubmitExamRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_student)
):
    exam = (
        db.query(Exam)
        .filter(Exam.id == exam_id)
        .first()
    )

    if not exam:
        raise HTTPException(
            status_code=404,
            detail="Không tìm thấy đề thi"
        )

    enrollment = (
        db.query(Enrollment)
        .filter(
            Enrollment.student_id == current_user.id,
            Enrollment.course_id == exam.course_id
        )
        .first()
    )

    if not enrollment:
        raise HTTPException(
            status_code=403,
            detail="Bạn chưa đăng ký khóa học này"
        )

    score = 0

    for item in data.answers:
        question = (
            db.query(Question)
            .filter(Question.id == item.question_id)
            .first()
        )

        answer = (
            db.query(Answer)
            .filter(Answer.id == item.answer_id)
            .first()
        )

        if question and answer:
            if answer.question_id == question.id and answer.is_correct:
                score += question.score

    attempt = ExamAttempt(
        exam_id=exam_id,
        student_id=current_user.id,
        score=score
    )

    db.add(attempt)
    db.commit()
    db.refresh(attempt)

    for item in data.answers:
        student_answer = StudentAnswer(
            attempt_id=attempt.id,
            question_id=item.question_id,
            answer_id=item.answer_id
        )

        db.add(student_answer)

    db.commit()

    return {
        "attempt_id": attempt.id,
        "exam_id": exam.id,
        "student_id": current_user.id,
        "score": score,
        "total_score": exam.total_score
    }

# MỤC ĐÍCH:
# API này cho học sinh xem toàn bộ lịch sử làm bài của mình.
# Frontend dùng cho màn "Điểm số" hoặc "Kết quả bài thi" trong dashboard học sinh.

@router.get("/my-attempts")
def get_my_exam_attempts(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_student)
):
    attempts = (
        db.query(ExamAttempt)
        .filter(ExamAttempt.student_id == current_user.id)
        .all()
    )

    return attempts

# MỤC ĐÍCH:
# API này cho học sinh xem chi tiết một lần làm bài:
# - Điểm
# - Câu đã chọn
# - Đáp án đúng/sai
# Dùng cho màn ExamResult trong thiết kế.

@router.get("/attempts/{attempt_id}/result")
def get_attempt_result(
    attempt_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_student)
):
    attempt = (
        db.query(ExamAttempt)
        .filter(
            ExamAttempt.id == attempt_id,
            ExamAttempt.student_id == current_user.id
        )
        .first()
    )

    if not attempt:
        raise HTTPException(
            status_code=404,
            detail="Không tìm thấy kết quả bài làm"
        )

    exam = (
        db.query(Exam)
        .filter(Exam.id == attempt.exam_id)
        .first()
    )

    student_answers = (
        db.query(StudentAnswer)
        .filter(StudentAnswer.attempt_id == attempt.id)
        .all()
    )

    result = []

    for student_answer in student_answers:
        question = (
            db.query(Question)
            .filter(Question.id == student_answer.question_id)
            .first()
        )

        selected_answer = (
            db.query(Answer)
            .filter(Answer.id == student_answer.answer_id)
            .first()
        )

        correct_answer = (
            db.query(Answer)
            .filter(
                Answer.question_id == question.id,
                Answer.is_correct == True
            )
            .first()
        )

        result.append(
            {
                "question_id": question.id,
                "question_content": question.content,
                "selected_answer": selected_answer.content,
                "is_correct": selected_answer.is_correct,
                "correct_answer": correct_answer.content if correct_answer else None
            }
        )

    return {
        "attempt_id": attempt.id,
        "exam_id": exam.id,
        "exam_title": exam.title,
        "score": attempt.score,
        "total_score": exam.total_score,
        "answers": result
    }


@router.get("/{exam_id}")
def get_exam_detail(
    exam_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_student)
):
    exam = (
        db.query(Exam)
        .filter(Exam.id == exam_id)
        .first()
    )

    if not exam:
        raise HTTPException(
            status_code=404,
            detail="Không tìm thấy bài kiểm tra"
        )

    enrollment = (
        db.query(Enrollment)
        .filter(
            Enrollment.student_id == current_user.id,
            Enrollment.course_id == exam.course_id
        )
        .first()
    )

    if not enrollment:
        raise HTTPException(
            status_code=403,
            detail="Bạn chưa đăng ký khóa học này"
        )

    questions = (
        db.query(Question)
        .filter(Question.exam_id == exam.id)
        .all()
    )

    result_questions = []

    for question in questions:
        answers = (
            db.query(Answer)
            .filter(Answer.question_id == question.id)
            .all()
        )

        result_questions.append({
            "id": question.id,
            "exam_id": question.exam_id,
            "content": question.content,
            "question_type": question.question_type,
            "score": question.score,
            "answers": [
                {
                    "id": answer.id,
                    "question_id": answer.question_id,
                    "content": answer.content
                }
                for answer in answers
            ]
        })

    return {
        "id": exam.id,
        "title": exam.title,
        "course_id": exam.course_id,
        "duration_minutes": exam.duration_minutes,
        "total_score": exam.total_score,
        "questions": result_questions
    }

@router.get("/attempts/{attempt_id}")
def get_attempt_result(
    attempt_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_student)
):
    attempt = (
        db.query(ExamAttempt)
        .filter(
            ExamAttempt.id == attempt_id,
            ExamAttempt.student_id == current_user.id
        )
        .first()
    )

    if not attempt:
        raise HTTPException(
            status_code=404,
            detail="Không tìm thấy kết quả bài làm"
        )

    exam = (
        db.query(Exam)
        .filter(Exam.id == attempt.exam_id)
        .first()
    )

    return {
        "id": attempt.id,
        "exam_id": attempt.exam_id,
        "student_id": attempt.student_id,
        "score": attempt.score,
        "submitted_at": attempt.submitted_at,
        "exam": {
            "id": exam.id,
            "title": exam.title,
            "total_score": exam.total_score,
            "duration_minutes": exam.duration_minutes
        } if exam else None
    }