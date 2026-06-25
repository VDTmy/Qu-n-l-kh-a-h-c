import { useEffect, useState } from "react";
import { StudentLayout } from "./StudentLayout";
import {
  LoadingState,
  EmptyState,
  ErrorState,
} from "../../components/ui/States";
import { enrollmentApi } from "../../services/studentApi";
import { Enrollment } from "../../services/api";
import { BookOpen } from "lucide-react";

export function StudentProgress() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    enrollmentApi
      .myCourses()
      .then((data) => {
        setEnrollments(data as Enrollment[]);
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

  return (
    <StudentLayout>
      <div className="mb-6">
        <h2>Tiến độ học tập</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Theo dõi tiến độ từng khóa học
        </p>
      </div>
      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState error={error} onRetry={load} />
      ) : enrollments.length === 0 ? (
        <EmptyState
          title="Chưa có tiến độ"
          description="Đăng ký khóa học để bắt đầu học"
          icon={BookOpen}
        />
      ) : (
        <div className="space-y-4">
          {enrollments.map((e) => {
            const course = e.course;

            const courseTitle = course?.title || `Khóa học #${e.course_id}`;

            const teacherName =
              course?.teacher?.full_name || "Chưa có thông tin giảng viên";

            const progressPercent = Number(e.progress_percent ?? 0);

            return (
              <div
                key={e.id}
                className="bg-card rounded-xl border border-border p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-medium">{courseTitle}</p>

                    <p className="text-xs text-muted-foreground mt-0.5">
                      GV: {teacherName}
                    </p>
                  </div>

                  <span className="text-sm font-semibold text-primary">
                    {Math.round(progressPercent)}%
                  </span>
                </div>

                <div className="h-2 bg-muted rounded-full">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </StudentLayout>
  );
}
