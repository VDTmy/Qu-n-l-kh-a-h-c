import { useEffect, useState } from "react";
import { StudentLayout } from "./StudentLayout";
import {
  LoadingState,
  EmptyState,
  ErrorState,
} from "../../components/ui/States";
import { studentApi } from "../../services/studentApi";
import { Target } from "lucide-react";

type ScoreItem = {
  id: number;
  score?: number | null;
  submitted_at?: string | null;
  exam?: {
    id: number;
    title: string;
    total_score?: number | null;
    max_score?: number | null;
  } | null;
  course?: {
    id: number;
    title: string;
  } | null;
};

export function StudentScores() {
  const [scores, setScores] = useState<ScoreItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    setError("");

    studentApi
      .myScores()
      .then((data) => {
        setScores(data as ScoreItem[]);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    load();
  }, []);

  const formatDate = (value?: string | null) => {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return date.toLocaleDateString("vi-VN");
  };

  return (
    <StudentLayout>
      <div className="mb-6">
        <h2>Điểm số</h2>

        <p className="text-sm text-muted-foreground mt-1">
          Kết quả các bài kiểm tra của bạn
        </p>
      </div>

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState error={error} onRetry={load} />
      ) : scores.length === 0 ? (
        <EmptyState
          title="Chưa có điểm số"
          description="Hoàn thành bài kiểm tra để xem điểm"
          icon={Target}
        />
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-border">
              <tr className="text-left text-muted-foreground">
                <th className="px-4 py-3 font-medium">Bài kiểm tra</th>
                <th className="px-4 py-3 font-medium">Khóa học</th>
                <th className="px-4 py-3 font-medium">Điểm</th>
                <th className="px-4 py-3 font-medium">Ngày thi</th>
              </tr>
            </thead>

            <tbody>
              {scores.map((scoreItem) => {
                const examTitle = scoreItem.exam?.title || "—";
                const courseTitle = scoreItem.course?.title || "—";
                const score = scoreItem.score ?? "—";
                const totalScore =
                  scoreItem.exam?.total_score ??
                  scoreItem.exam?.max_score ??
                  null;

                return (
                  <tr
                    key={scoreItem.id}
                    className="border-b border-border last:border-0 hover:bg-muted/50"
                  >
                    <td className="px-4 py-3">{examTitle}</td>

                    <td className="px-4 py-3 text-muted-foreground">
                      {courseTitle}
                    </td>

                    <td className="px-4 py-3 font-semibold text-primary">
                      {totalScore ? `${score} / ${totalScore}` : score}
                    </td>

                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDate(scoreItem.submitted_at)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </StudentLayout>
  );
}
