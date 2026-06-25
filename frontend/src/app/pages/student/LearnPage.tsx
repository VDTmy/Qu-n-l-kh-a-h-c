import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import {
  LoadingState,
  ErrorState,
  EmptyState,
} from "../../components/ui/States";
import { lessonApi } from "../../services/lessonApi";
import { progressApi, commentApi } from "../../services/studentApi";
import { examApi } from "../../services/examApi";
import { Lesson, Exam, assetUrl } from "../../services/api";
import {
  Check,
  ChevronLeft,
  FileText,
  PlayCircle,
  Send,
  ClipboardList,
} from "lucide-react";
import { toast } from "sonner";

type TabType = "content" | "comments" | "exams";

type CommentItem = {
  id?: number;
  content?: string;
  student_name?: string | null;
};

type ExamDisplay = Exam & {
  total_score?: number;
  max_score?: number;
};

export function LearnPage() {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);

  const [comments, setComments] = useState<CommentItem[]>([]);
  const [comment, setComment] = useState("");

  const [exams, setExams] = useState<ExamDisplay[]>([]);
  const [tab, setTab] = useState<TabType>("content");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!courseId) return;

    setLoading(true);
    setError("");

    Promise.all([
      lessonApi.byCourse(Number(courseId)),
      commentApi.byCourse(Number(courseId)).catch(() => []),
      examApi.byCourse(Number(courseId)).catch(() => []),
    ])
      .then(([lessonData, commentData, examData]) => {
        const lessonList = lessonData as Lesson[];

        setLessons(lessonList);
        setComments(commentData as CommentItem[]);
        setExams(examData as ExamDisplay[]);

        const selectedLesson =
          lessonList.find((lesson) => String(lesson.id) === String(lessonId)) ||
          lessonList[0] ||
          null;

        setCurrentLesson(selectedLesson);
        setLoading(false);
      })
      .catch((e: unknown) => {
        setError((e as Error).message);
        setLoading(false);
      });
  }, [courseId, lessonId]);

  const markDone = async () => {
    const finalLessonId = Number(currentLesson?.id ?? lessonId);

    if (!finalLessonId || Number.isNaN(finalLessonId)) {
      toast.error("Không tìm thấy ID bài học");
      return;
    }

    try {
      await progressApi.markLesson(finalLessonId);
      toast.success("Đã đánh dấu hoàn thành!");
    } catch (e: unknown) {
      toast.error((e as Error).message);
    }
  };

  const sendComment = async () => {
    if (!comment.trim() || !courseId) return;

    try {
      const newComment = await commentApi.create({
        content: comment,
        course_id: Number(courseId),
        lesson_id: currentLesson?.id,
      });

      setComments((prev) => [...prev, newComment as CommentItem]);
      setComment("");
      toast.success("Đã gửi bình luận");
    } catch (e: unknown) {
      toast.error((e as Error).message);
    }
  };

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

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <header className="h-14 bg-sidebar flex items-center px-4 gap-4 flex-shrink-0">
        <button
          onClick={() => navigate("/student/courses")}
          className="flex items-center gap-1.5 text-sidebar-foreground hover:text-white text-sm"
        >
          <ChevronLeft className="w-4 h-4" />
          Khóa học
        </button>

        <span className="text-sidebar-foreground/70 text-sm truncate">
          {currentLesson?.title}
        </span>

        {currentLesson && (
          <button
            onClick={markDone}
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
          >
            <Check className="w-4 h-4" />
            Hoàn thành
          </button>
        )}
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-72 bg-white border-r border-border overflow-y-auto hidden md:block flex-shrink-0">
          <div className="p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Danh sách bài học
            </p>

            {lessons.length === 0 ? (
              <EmptyState title="Chưa có bài học" />
            ) : (
              <div className="space-y-1">
                {lessons.map((lesson) => {
                  const isVideo =
                    lesson.lesson_type === "video" || Boolean(lesson.video_url);

                  return (
                    <button
                      key={lesson.id}
                      onClick={() => {
                        setCurrentLesson(lesson);
                        navigate(`/learn/${courseId}/${lesson.id}`);
                      }}
                      className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                        currentLesson?.id === lesson.id
                          ? "bg-primary text-white"
                          : "hover:bg-secondary text-foreground"
                      }`}
                    >
                      {isVideo ? (
                        <PlayCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      ) : (
                        <FileText className="w-3.5 h-3.5 flex-shrink-0" />
                      )}

                      <span className="line-clamp-2">{lesson.title}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto">
          {!currentLesson ? (
            <EmptyState title="Chọn bài học để bắt đầu" />
          ) : (
            <div className="max-w-4xl mx-auto p-6">
              {currentLesson.video_url ? (
                <div className="aspect-video bg-black rounded-xl overflow-hidden mb-6">
                  <video
                    src={assetUrl(currentLesson.video_url)}
                    controls
                    className="w-full h-full"
                  />
                </div>
              ) : (
                <div className="aspect-video bg-muted rounded-xl flex items-center justify-center mb-6">
                  <div className="text-center">
                    <PlayCircle className="w-16 h-16 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">Video chưa có</p>
                  </div>
                </div>
              )}

              <div className="flex gap-3 border-b border-border mb-6">
                {[
                  { key: "content", label: "Nội dung" },
                  { key: "comments", label: "Bình luận" },
                  { key: "exams", label: "Bài kiểm tra" },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setTab(item.key as TabType)}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                      tab === item.key
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {tab === "content" ? (
                <div>
                  <h2 className="mb-2">{currentLesson.title}</h2>

                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {currentLesson.description ||
                      currentLesson.content ||
                      "Không có mô tả"}
                  </p>

                  {currentLesson.document_url && (
                    <a
                      href={assetUrl(currentLesson.document_url) || "#"}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-secondary text-primary rounded-lg text-sm hover:bg-primary hover:text-white transition-colors"
                    >
                      <FileText className="w-4 h-4" />
                      Tải tài liệu
                    </a>
                  )}
                </div>
              ) : tab === "comments" ? (
                <div>
                  <div className="flex gap-3 mb-4">
                    <input
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Viết bình luận..."
                      className="flex-1 px-4 py-2 rounded-xl border border-border bg-input-background outline-none focus:border-primary text-sm"
                    />

                    <button
                      onClick={sendComment}
                      className="px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    {comments.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        Chưa có bình luận.
                      </p>
                    ) : (
                      comments.map((item, index) => (
                        <div
                          key={item.id ?? index}
                          className="bg-muted rounded-lg p-3"
                        >
                          <p className="text-xs font-medium text-foreground mb-1">
                            {item.student_name || "Học viên"}
                          </p>

                          <p className="text-sm text-muted-foreground">
                            {item.content}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {exams.length === 0 ? (
                    <div className="text-sm text-muted-foreground">
                      Chưa có bài kiểm tra cho khóa học này.
                    </div>
                  ) : (
                    exams.map((exam) => (
                      <div
                        key={exam.id}
                        className="bg-muted rounded-xl p-4 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <ClipboardList className="w-5 h-5 text-primary" />

                          <div>
                            <p className="font-medium">{exam.title}</p>

                            <p className="text-sm text-muted-foreground">
                              {exam.duration_minutes} phút ·{" "}
                              {exam.total_score ?? exam.max_score ?? 10} điểm
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => navigate(`/exam/${exam.id}`)}
                          className="px-4 py-2 bg-primary text-white rounded-lg text-sm"
                        >
                          Làm bài
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
