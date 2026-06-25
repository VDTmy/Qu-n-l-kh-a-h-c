import { api, Exam, Question, Answer } from "./api";

export const examApi = {
  byCourse: (courseId: number) => api.get<Exam[]>(`/exams/course/${courseId}`),

  detail: (examId: number) => api.get<Exam>(`/exams/${examId}`),

  create: (data: {
    title: string;
    course_id: number;
    duration_minutes: number;
    total_score: number;
  }) =>
    api.post<Exam>("/exams/", {
      title: data.title,
      course_id: data.course_id,
      duration_minutes: data.duration_minutes,
      total_score: data.total_score,
      description: "",
    }),

  addQuestion: (data: {
    exam_id: number;
    content: string;
    question_type: string;
    score: number;
  }) =>
    api.post<Question>("/exams/questions", {
      exam_id: data.exam_id,
      content: data.content,
      question_type: data.question_type,
      score: data.score,
    }),

  addAnswer: (data: {
    question_id: number;
    content: string;
    is_correct: boolean;
  }) => api.post<Answer>("/exams/answers", data),

  submit: (examId: number, answers: Record<number, number>) =>
    api.post(`/exams/${examId}/submit`, {
      answers: Object.entries(answers).map(([questionId, answerId]) => ({
        question_id: Number(questionId),
        answer_id: Number(answerId),
      })),
    }),

  attemptResult: (attemptId: number) => api.get(`/exams/attempts/${attemptId}`),
};
