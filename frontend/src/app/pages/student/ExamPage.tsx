import { useCallback, useEffect, useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router";
import { LoadingState, ErrorState } from "../../components/ui/States";
import { examApi } from "../../services/examApi";
import { Exam } from "../../services/api";
import { Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";

type AttemptResult = {
  id?: number;
  exam_id?: number;
  student_id?: number;
  score?: number;
  submitted_at?: string;
  exam?: {
    id?: number;
    title?: string;
    max_score?: number;
    total_score?: number;
    duration_minutes?: number;
  };
};

export function ExamPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    setError("");

    examApi
      .detail(Number(id))
      .then((data) => {
        setExam(data);
        setTimeLeft((data.duration_minutes || 0) * 60);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, [id]);

  const formatTime = (seconds: number | null) => {
    if (seconds === null) return "--:--";

    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleSubmit = useCallback(
    async (forceSubmit = false) => {
      if (!exam || submitted || submitting) return;

      const unanswered = (exam.questions || []).filter(
        (question) => !answers[question.id],
      );

      if (
        !forceSubmit &&
        unanswered.length > 0 &&
        !confirm(`Còn ${unanswered.length} câu chưa trả lời. Vẫn nộp bài?`)
      ) {
        return;
      }

      setSubmitting(true);

      try {
        const attempt = (await examApi.submit(
          exam.id,
          answers,
        )) as AttemptResult;

        setSubmitted(true);
        toast.success("Nộp bài thành công!");

        const attemptId = attempt.id;

        if (attemptId) {
          navigate(`/exam/${attemptId}/result`, {
            state: {
              attempt,
            },
            replace: true,
          });
        } else {
          navigate(`/exam/${id}/result`, {
            state: {
              attempt,
            },
            replace: true,
          });
        }
      } catch (e: unknown) {
        toast.error((e as Error).message);
      } finally {
        setSubmitting(false);
      }
    },
    [exam, answers, submitted, submitting, navigate, id],
  );

  useEffect(() => {
    if (timeLeft === null || submitted) return;

    if (timeLeft <= 0) {
      handleSubmit(true);
      return;
    }

    const timer = window.setTimeout(() => {
      setTimeLeft((prev) => {
        if (prev === null) return null;
        return prev - 1;
      });
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [timeLeft, submitted, handleSubmit]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <LoadingState />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto p-8">
        <ErrorState error={error} />
      </div>
    );
  }

  if (!exam) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white border-b border-border sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div>
            <p className="font-semibold">{exam.title}</p>
            <p className="text-xs text-muted-foreground">
              {(exam.questions || []).length} câu hỏi · {exam.duration_minutes}{" "}
              phút
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div
              className={`flex items-center gap-1.5 text-sm font-medium ${
                timeLeft !== null && timeLeft <= 60
                  ? "text-red-500"
                  : "text-muted-foreground"
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>{formatTime(timeLeft)}</span>
            </div>

            <button
              onClick={() => handleSubmit(false)}
              disabled={submitting || submitted}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-60"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Nộp bài
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {(exam.questions || []).map((question, questionIndex) => (
            <div
              key={question.id}
              className="bg-card rounded-xl border border-border p-5"
            >
              <p className="font-medium mb-4 text-sm">
                Câu {questionIndex + 1}: {question.content}
              </p>

              <div className="space-y-2">
                {(question.answers || []).map((answer) => (
                  <label
                    key={answer.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      answers[question.id] === answer.id
                        ? "border-primary bg-secondary text-primary"
                        : "border-border hover:border-primary/40 hover:bg-secondary/50"
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      className="hidden"
                      checked={answers[question.id] === answer.id}
                      onChange={() =>
                        setAnswers((prev) => ({
                          ...prev,
                          [question.id]: answer.id,
                        }))
                      }
                    />

                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        answers[question.id] === answer.id
                          ? "border-primary"
                          : "border-border"
                      }`}
                    >
                      {answers[question.id] === answer.id && (
                        <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                      )}
                    </div>

                    <span className="text-sm">{answer.content}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={() => handleSubmit(false)}
            disabled={submitting || submitted}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 disabled:opacity-60"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Nộp bài thi
          </button>
        </div>
      </div>
    </div>
  );
}

export function ExamResultPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [attempt, setAttempt] = useState<AttemptResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const stateAttempt = (location.state as { attempt?: AttemptResult } | null)
      ?.attempt;

    if (stateAttempt) {
      setAttempt(stateAttempt);
      setLoading(false);
      return;
    }

    if (!id) return;

    examApi
      .attemptResult(Number(id))
      .then((data) => {
        setAttempt(data as AttemptResult);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, [id, location.state]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <LoadingState />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto p-8">
        <ErrorState error={error} />
      </div>
    );
  }

  const score = Number(attempt?.score ?? 0);
  const maxScore = Number(
    attempt?.exam?.total_score ?? attempt?.exam?.max_score ?? 10,
  );

  const percent = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl border border-border shadow-lg p-8 max-w-md w-full text-center">
        <div
          className={`w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center text-3xl font-bold text-white ${
            percent >= 70
              ? "bg-green-500"
              : percent >= 50
                ? "bg-yellow-500"
                : "bg-red-500"
          }`}
        >
          {score}
        </div>

        <h2 className="mb-2">
          {percent >= 70
            ? "🎉 Xuất sắc!"
            : percent >= 50
              ? "👍 Khá tốt"
              : "📚 Cần cố gắng hơn"}
        </h2>

        <p className="text-muted-foreground text-sm mb-1">Điểm số của bạn</p>

        <p className="text-4xl font-bold text-foreground mb-4">
          {score} / {maxScore}
        </p>

        <div className="h-3 bg-muted rounded-full mb-6">
          <div
            className={`h-full rounded-full ${
              percent >= 70
                ? "bg-green-500"
                : percent >= 50
                  ? "bg-yellow-500"
                  : "bg-red-500"
            }`}
            style={{
              width: `${percent}%`,
            }}
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => navigate("/student/scores")}
            className="flex-1 py-2.5 border border-border rounded-xl text-sm font-medium hover:bg-muted"
          >
            Xem điểm số
          </button>

          <button
            onClick={() => navigate("/student/courses")}
            className="flex-1 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90"
          >
            Về khóa học
          </button>
        </div>
      </div>
    </div>
  );
}
