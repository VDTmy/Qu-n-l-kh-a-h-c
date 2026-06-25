import { useEffect, useState } from "react";
import { TeacherLayout } from "./TeacherLayout";
import {
  LoadingState,
  EmptyState,
  ErrorState,
} from "../../components/ui/States";
import { teacherApi } from "../../services/teacherApi";
import { examApi } from "../../services/examApi";
import { Course, Exam } from "../../services/api";
import { ClipboardList, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface QAForm {
  content: string;
  answers: {
    content: string;
    is_correct: boolean;
  }[];
}

export function TeacherExams() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedCourse, setSelectedCourse] = useState("");

  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingExams, setLoadingExams] = useState(false);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [examForm, setExamForm] = useState({
    title: "",
    duration_minutes: 60,
    total_score: 10,
  });

  const [questions, setQuestions] = useState<QAForm[]>([
    {
      content: "",
      answers: [
        { content: "", is_correct: true },
        { content: "", is_correct: false },
        { content: "", is_correct: false },
        { content: "", is_correct: false },
      ],
    },
  ]);

  const loadCourses = async () => {
    setLoadingCourses(true);
    setError("");

    try {
      const data = await teacherApi.myCourses();
      const courseList = data as Course[];

      setCourses(courseList);

      if (courseList.length > 0) {
        setSelectedCourse(String(courseList[0].id));
      }
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setLoadingCourses(false);
    }
  };

  const loadExams = async (courseId: number) => {
    setLoadingExams(true);

    try {
      const data = await examApi.byCourse(courseId);
      setExams(data as Exam[]);
    } catch (e: unknown) {
      toast.error((e as Error).message);
    } finally {
      setLoadingExams(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    if (!selectedCourse) {
      setExams([]);
      return;
    }

    loadExams(Number(selectedCourse));
  }, [selectedCourse]);

  const resetForm = () => {
    setExamForm({
      title: "",
      duration_minutes: 60,
      total_score: 10,
    });

    setQuestions([
      {
        content: "",
        answers: [
          { content: "", is_correct: true },
          { content: "", is_correct: false },
          { content: "", is_correct: false },
          { content: "", is_correct: false },
        ],
      },
    ]);
  };

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        content: "",
        answers: [
          { content: "", is_correct: true },
          { content: "", is_correct: false },
          { content: "", is_correct: false },
          { content: "", is_correct: false },
        ],
      },
    ]);
  };

  const removeQuestion = (index: number) => {
    setQuestions((prev) => prev.filter((_, idx) => idx !== index));
  };

  const setQuestionContent = (questionIndex: number, value: string) => {
    setQuestions((prev) =>
      prev.map((question, index) =>
        index === questionIndex
          ? {
              ...question,
              content: value,
            }
          : question,
      ),
    );
  };

  const setAnswerContent = (
    questionIndex: number,
    answerIndex: number,
    value: string,
  ) => {
    setQuestions((prev) =>
      prev.map((question, index) =>
        index === questionIndex
          ? {
              ...question,
              answers: question.answers.map((answer, idx) =>
                idx === answerIndex
                  ? {
                      ...answer,
                      content: value,
                    }
                  : answer,
              ),
            }
          : question,
      ),
    );
  };

  const setCorrectAnswer = (questionIndex: number, answerIndex: number) => {
    setQuestions((prev) =>
      prev.map((question, index) =>
        index === questionIndex
          ? {
              ...question,
              answers: question.answers.map((answer, idx) => ({
                ...answer,
                is_correct: idx === answerIndex,
              })),
            }
          : question,
      ),
    );
  };

  const validateQuestions = () => {
    for (const question of questions) {
      if (!question.content.trim()) {
        toast.error("Vui lòng nhập nội dung câu hỏi");
        return false;
      }

      const validAnswers = question.answers.filter((answer) =>
        answer.content.trim(),
      );

      if (validAnswers.length < 2) {
        toast.error("Mỗi câu hỏi cần ít nhất 2 đáp án");
        return false;
      }

      const hasCorrectAnswer = question.answers.some(
        (answer) => answer.is_correct && answer.content.trim(),
      );

      if (!hasCorrectAnswer) {
        toast.error("Mỗi câu hỏi cần có đáp án đúng");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCourse) {
      toast.error("Vui lòng chọn khóa học");
      return;
    }

    if (!examForm.title.trim()) {
      toast.error("Vui lòng nhập tên bài kiểm tra");
      return;
    }

    if (!validateQuestions()) {
      return;
    }

    setSaving(true);

    try {
      const exam = await examApi.create({
        title: examForm.title,
        course_id: Number(selectedCourse),
        duration_minutes: Number(examForm.duration_minutes),
        total_score: Number(examForm.total_score),
      });

      const scorePerQuestion = Number(examForm.total_score) / questions.length;

      for (const questionForm of questions) {
        const question = await examApi.addQuestion({
          exam_id: exam.id,
          content: questionForm.content,
          question_type: "single_choice",
          score: scorePerQuestion,
        });

        for (const answerForm of questionForm.answers) {
          if (!answerForm.content.trim()) continue;

          await examApi.addAnswer({
            question_id: question.id,
            content: answerForm.content,
            is_correct: answerForm.is_correct,
          });
        }
      }

      toast.success("Đã tạo bài kiểm tra!");

      setShowForm(false);
      resetForm();

      await loadExams(Number(selectedCourse));
    } catch (err: unknown) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const inputCls =
    "w-full px-3 py-2 rounded-lg border border-border bg-input-background outline-none focus:border-primary text-sm";

  return (
    <TeacherLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2>Quản lý bài kiểm tra</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Tạo và quản lý bài kiểm tra cho khóa học
          </p>
        </div>
      </div>

      {loadingCourses ? (
        <LoadingState />
      ) : error ? (
        <ErrorState error={error} onRetry={loadCourses} />
      ) : courses.length === 0 ? (
        <EmptyState
          title="Chưa có khóa học"
          description="Bạn cần tạo khóa học trước khi tạo bài kiểm tra"
          icon={ClipboardList}
        />
      ) : (
        <>
          <div className="mb-5 flex gap-4 items-end">
            <div className="flex-1 max-w-xs">
              <label className="block text-sm font-medium mb-1.5">
                Chọn khóa học
              </label>

              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-white text-sm outline-none"
              >
                <option value="">-- Chọn khóa học --</option>

                {courses.map((course) => (
                  <option key={course.id} value={String(course.id)}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>

            {selectedCourse && (
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-primary text-white rounded-xl text-sm"
              >
                <Plus className="w-4 h-4" />
                Thêm bài kiểm tra
              </button>
            )}
          </div>

          {loadingExams ? (
            <LoadingState />
          ) : showForm ? (
            <form onSubmit={handleSubmit} className="space-y-5 max-w-3xl">
              <div className="bg-card rounded-xl border border-border p-5 space-y-4">
                <h3>Thông tin bài kiểm tra</h3>

                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-3">
                    <label className="block text-sm font-medium mb-1">
                      Tên bài kiểm tra
                    </label>

                    <input
                      required
                      value={examForm.title}
                      onChange={(e) =>
                        setExamForm((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      className={inputCls}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Thời gian (phút)
                    </label>

                    <input
                      type="number"
                      value={examForm.duration_minutes}
                      onChange={(e) =>
                        setExamForm((prev) => ({
                          ...prev,
                          duration_minutes: Number(e.target.value),
                        }))
                      }
                      className={inputCls}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Điểm tối đa
                    </label>

                    <input
                      type="number"
                      value={examForm.total_score}
                      onChange={(e) =>
                        setExamForm((prev) => ({
                          ...prev,
                          total_score: Number(e.target.value),
                        }))
                      }
                      className={inputCls}
                    />
                  </div>
                </div>
              </div>

              {questions.map((question, questionIndex) => (
                <div
                  key={questionIndex}
                  className="bg-card rounded-xl border border-border p-5"
                >
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-medium text-sm">
                      Câu {questionIndex + 1}
                    </p>

                    {questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeQuestion(questionIndex)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <input
                    value={question.content}
                    onChange={(e) =>
                      setQuestionContent(questionIndex, e.target.value)
                    }
                    className={`${inputCls} mb-4`}
                    placeholder="Nội dung câu hỏi..."
                  />

                  <div className="grid grid-cols-2 gap-3">
                    {question.answers.map((answer, answerIndex) => (
                      <div
                        key={answerIndex}
                        className="flex items-center gap-2"
                      >
                        <input
                          type="radio"
                          checked={answer.is_correct}
                          onChange={() =>
                            setCorrectAnswer(questionIndex, answerIndex)
                          }
                          className="w-4 h-4 accent-primary flex-shrink-0"
                        />

                        <input
                          value={answer.content}
                          onChange={(e) =>
                            setAnswerContent(
                              questionIndex,
                              answerIndex,
                              e.target.value,
                            )
                          }
                          className={inputCls}
                          placeholder={`Đáp án ${
                            ["A", "B", "C", "D"][answerIndex]
                          }`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addQuestion}
                className="w-full py-2.5 border-2 border-dashed border-border rounded-xl text-sm text-muted-foreground hover:border-primary hover:text-primary flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Thêm câu hỏi
              </button>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-medium disabled:opacity-60"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  Tạo bài kiểm tra
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="px-5 py-2.5 border border-border rounded-xl text-sm"
                >
                  Hủy
                </button>
              </div>
            </form>
          ) : exams.length === 0 ? (
            <EmptyState title="Chưa có bài kiểm tra" icon={ClipboardList} />
          ) : (
            <div className="space-y-3">
              {exams.map((exam) => (
                <div
                  key={exam.id}
                  className="bg-card rounded-xl border border-border p-4 flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium">{exam.title}</p>

                    <p className="text-sm text-muted-foreground mt-0.5">
                      {exam.duration_minutes} phút · {exam.total_score} điểm
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </TeacherLayout>
  );
}
