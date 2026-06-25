import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { TeacherLayout } from "./TeacherLayout";
import {
  LoadingState,
  EmptyState,
  ErrorState,
} from "../../components/ui/States";
import { teacherApi } from "../../services/teacherApi";
import { Course, Enrollment, User } from "../../services/api";
import { Users } from "lucide-react";

type EnrollmentWithStudent = Enrollment & {
  created_at?: string | null;
  enrolled_at?: string | null;
  student?: User | null;
};

export function TeacherStudents() {
  const [searchParams] = useSearchParams();

  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<EnrollmentWithStudent[]>([]);
  const [selectedCourse, setSelectedCourse] = useState(
    searchParams.get("course") || "",
  );

  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [error, setError] = useState("");

  const loadCourses = async () => {
    setLoadingCourses(true);
    setError("");

    try {
      const data = await teacherApi.myCourses();
      const courseList = data as Course[];

      setCourses(courseList);

      const courseFromUrl = searchParams.get("course");

      const validCourse = courseList.find(
        (course) => String(course.id) === String(courseFromUrl),
      );

      if (validCourse) {
        setSelectedCourse(String(validCourse.id));
      } else if (courseList.length > 0) {
        setSelectedCourse(String(courseList[0].id));
      } else {
        setSelectedCourse("");
      }
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setLoadingCourses(false);
    }
  };

  const loadStudents = async (courseId: number) => {
    setLoadingStudents(true);
    setError("");

    try {
      const data = await teacherApi.myCourseStudents(courseId);
      setStudents(data as EnrollmentWithStudent[]);
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setLoadingStudents(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    if (!selectedCourse) {
      setStudents([]);
      return;
    }

    loadStudents(Number(selectedCourse));
  }, [selectedCourse]);

  const formatDate = (value?: string | null) => {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return date.toLocaleDateString("vi-VN");
  };

  return (
    <TeacherLayout>
      <div className="mb-6">
        <h2>Danh sách học sinh</h2>

        <p className="text-sm text-muted-foreground mt-1">
          Xem học sinh đã đăng ký khóa học
        </p>
      </div>

      {loadingCourses ? (
        <LoadingState />
      ) : error && courses.length === 0 ? (
        <ErrorState error={error} onRetry={loadCourses} />
      ) : courses.length === 0 ? (
        <EmptyState
          title="Chưa có khóa học"
          description="Bạn cần có khóa học trước khi xem học sinh"
          icon={Users}
        />
      ) : (
        <>
          <div className="mb-5">
            <label className="block text-sm font-medium mb-1.5">
              Chọn khóa học
            </label>

            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-border bg-white text-sm outline-none focus:border-primary w-full max-w-xs"
            >
              <option value="">-- Chọn khóa học --</option>

              {courses.map((course) => (
                <option key={course.id} value={String(course.id)}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>

          {!selectedCourse ? (
            <EmptyState title="Chọn khóa học để xem học sinh" icon={Users} />
          ) : loadingStudents ? (
            <LoadingState />
          ) : error ? (
            <ErrorState
              error={error}
              onRetry={() => loadStudents(Number(selectedCourse))}
            />
          ) : students.length === 0 ? (
            <EmptyState title="Chưa có học sinh đăng ký" icon={Users} />
          ) : (
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="px-4 py-3 border-b border-border bg-muted/50">
                <p className="text-sm text-muted-foreground">
                  {students.length} học sinh
                </p>
              </div>

              <table className="w-full text-sm">
                <thead className="border-b border-border">
                  <tr className="text-left text-muted-foreground">
                    <th className="px-4 py-3 font-medium">#</th>
                    <th className="px-4 py-3 font-medium">Họ tên</th>
                    <th className="px-4 py-3 font-medium">Email</th>
                    <th className="px-4 py-3 font-medium">Tiến độ</th>
                    <th className="px-4 py-3 font-medium">Ngày đăng ký</th>
                  </tr>
                </thead>

                <tbody>
                  {students.map((enrollment, index) => {
                    const studentInfo = enrollment.student;

                    const studentName =
                      studentInfo?.full_name ||
                      `Học viên #${enrollment.student_id}`;

                    const studentEmail = studentInfo?.email || "—";

                    const enrolledDate =
                      enrollment.created_at || enrollment.enrolled_at || null;

                    return (
                      <tr
                        key={enrollment.id}
                        className="border-b border-border last:border-0 hover:bg-muted/30"
                      >
                        <td className="px-4 py-3 text-muted-foreground">
                          {index + 1}
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white text-xs font-medium">
                              {studentName.charAt(0).toUpperCase()}
                            </div>

                            {studentName}
                          </div>
                        </td>

                        <td className="px-4 py-3 text-muted-foreground">
                          {studentEmail}
                        </td>

                        <td className="px-4 py-3 text-muted-foreground">
                          {Math.round(enrollment.progress_percent ?? 0)}%
                        </td>

                        <td className="px-4 py-3 text-muted-foreground">
                          {formatDate(enrolledDate)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </TeacherLayout>
  );
}
