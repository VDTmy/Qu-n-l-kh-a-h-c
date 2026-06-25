# MỤC ĐÍCH:
# Schema này dùng cho tạo đề thi, câu hỏi và đáp án.

from pydantic import BaseModel


class ExamCreate(BaseModel):
    course_id: int
    title: str
    description: str | None = None
    duration_minutes: int = 45
    total_score: int = 10


class ExamResponse(BaseModel):
    id: int
    course_id: int
    teacher_id: int
    title: str
    description: str | None
    duration_minutes: int
    total_score: int
    status: str

    class Config:
        from_attributes = True


class QuestionCreate(BaseModel):
    exam_id: int
    content: str
    question_type: str = "single_choice"
    score: int = 1


class QuestionResponse(BaseModel):
    id: int
    exam_id: int
    content: str
    question_type: str
    score: int

    class Config:
        from_attributes = True


class AnswerCreate(BaseModel):
    question_id: int
    content: str
    is_correct: bool = False


class AnswerResponse(BaseModel):
    id: int
    question_id: int
    content: str
    is_correct: bool

    class Config:
        from_attributes = True


# MỤC ĐÍCH:
# Schema này dùng khi học sinh nộp bài thi.
# answers là danh sách câu trả lời học sinh chọn.
# Mỗi phần tử gồm question_id và answer_id.

class SubmitAnswerItem(BaseModel):
    question_id: int
    answer_id: int


class SubmitExamRequest(BaseModel):
    answers: list[SubmitAnswerItem]


class SubmitExamResponse(BaseModel):
    attempt_id: int
    exam_id: int
    student_id: int
    score: float
    total_score: int