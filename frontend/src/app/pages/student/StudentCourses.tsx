import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { StudentLayout } from "./StudentLayout";
import {
  LoadingState,
  EmptyState,
  ErrorState,
} from "../../components/ui/States";
import { enrollmentApi } from "../../services/studentApi";
import { Enrollment, assetUrl } from "../../services/api";
import { BookOpen, PlayCircle } from "lucide-react";
import { lessonApi } from "../../services/lessonApi";
import { toast } from "sonner";

export function StudentCourses() {
  const navigate = useNavigate();

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

  // MỤC ĐÍCH:
  // Khi học sinh bấm "Tiếp tục học":
  // - Lấy danh sách bài học của khóa học.
  // - Nếu có bài học thì mở bài đầu tiên.
  // - Nếu chưa có bài học thì báo lỗi đẹp, không vào màn trống.

  const handleContinueLearning = async (courseId: number) => {
    try {
      const lessons = await lessonApi.byCourse(courseId);

      if (!lessons || lessons.length === 0) {
        toast.error("Khóa học này chưa có bài học");
        return;
      }

      navigate(`/learn/${courseId}/${lessons[0].id}`);
    } catch (error) {
      toast.error("Không thể mở khóa học");
    }
  };

  return (
    <StudentLayout>
      <div className="mb-6">
        <h2>Khóa học của tôi</h2>

        <p className="text-sm text-muted-foreground mt-1">
          Tất cả khóa học bạn đã đăng ký
        </p>
      </div>

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState error={error} onRetry={load} />
      ) : enrollments.length === 0 ? (
        <EmptyState
          title="Bạn chưa đăng ký khóa học nào"
          description="Hãy khám phá các khóa học phù hợp với bạn"
          icon={BookOpen}
          action={
            <Link
              to="/courses"
              className="px-4 py-2 bg-primary text-white rounded-lg text-sm"
            >
              Khám phá khóa học
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {enrollments.map((enrollment) => {
            const course = enrollment.course;

            if (!course) {
              return null;
            }

            return (
              <div
                key={enrollment.id}
                className="bg-card rounded-xl border border-border shadow-sm overflow-hidden group hover:shadow-md transition-all"
              >
                <div className="aspect-video bg-secondary relative">
                  {course.thumbnail_url ? (
                    <img
                      src={assetUrl(course.thumbnail_url)}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="w-10 h-10 text-muted-foreground" />
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-foreground line-clamp-2 mb-1">
                    {course.title}
                  </h3>

                  {course.teacher && (
                    <p className="text-xs text-muted-foreground mb-3">
                      GV: {course.teacher.full_name}
                    </p>
                  )}

                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Tiến độ</span>

                      <span>
                        {Math.round(enrollment.progress_percent ?? 0)}%
                      </span>
                    </div>

                    <div className="h-1.5 bg-muted rounded-full">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{
                          width: `${enrollment.progress_percent ?? 0}%`,
                        }}
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => handleContinueLearning(course.id)}
                    className="w-full flex items-center justify-center gap-2 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    <PlayCircle className="w-4 h-4" />
                    Tiếp tục học
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </StudentLayout>
  );
}
