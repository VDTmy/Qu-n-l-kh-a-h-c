import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { TeacherLayout } from "./TeacherLayout";
import { LoadingState, EmptyState } from "../../components/ui/States";
import { teacherApi } from "../../services/teacherApi";
import { lessonApi } from "../../services/lessonApi";
import { Course, Section, Lesson } from "../../services/api";
import { FileText, Loader2, Plus, Upload, Video } from "lucide-react";
import { toast } from "sonner";

export function TeacherLessons() {
  const [searchParams] = useSearchParams();

  const [courses, setCourses] = useState<Course[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedCourse, setSelectedCourse] = useState("");

  const [loading, setLoading] = useState(false);
  const [showAddSection, setShowAddSection] = useState(false);
  const [showAddLesson, setShowAddLesson] = useState(false);
  const [sectionTitle, setSectionTitle] = useState("");
  const [saving, setSaving] = useState(false);

  const [lessonForm, setLessonForm] = useState({
    title: "",
    section_id: "",
    lesson_type: "video",
    description: "",
    duration: "",
  });

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [docFile, setDocFile] = useState<File | null>(null);

  useEffect(() => {
    teacherApi
      .myCourses()
      .then((data) => {
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
      })
      .catch((e) => {
        toast.error((e as Error).message);
      });
  }, [searchParams]);

  const loadLessons = async (courseId: number) => {
    setLoading(true);

    try {
      const [sectionData, lessonData] = await Promise.all([
        lessonApi.sectionsByCourse(courseId),
        lessonApi.byCourse(courseId),
      ]);

      setSections(sectionData as Section[]);
      setLessons(lessonData as Lesson[]);
    } catch (e: unknown) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedCourse) {
      setSections([]);
      setLessons([]);
      return;
    }

    loadLessons(Number(selectedCourse));
  }, [selectedCourse]);

  const addSection = async () => {
    if (!selectedCourse) {
      toast.error("Vui lòng chọn khóa học");
      return;
    }

    if (!sectionTitle.trim()) {
      toast.error("Vui lòng nhập tên chương");
      return;
    }

    setSaving(true);

    try {
      await lessonApi.createSection({
        title: sectionTitle,
        course_id: Number(selectedCourse),
        order_index: sections.length + 1,
      });

      toast.success("Đã thêm chương");

      setSectionTitle("");
      setShowAddSection(false);

      await loadLessons(Number(selectedCourse));
    } catch (e: unknown) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const addLesson = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCourse) {
      toast.error("Vui lòng chọn khóa học");
      return;
    }

    if (sections.length === 0) {
      toast.error("Vui lòng thêm chương trước");
      return;
    }

    if (!lessonForm.title.trim() || !lessonForm.section_id) {
      toast.error("Vui lòng điền đầy đủ");
      return;
    }

    if (lessonForm.lesson_type === "video" && !videoFile) {
      toast.error("Vui lòng upload video");
      return;
    }

    setSaving(true);

    try {
      let newLesson = await lessonApi.createLesson({
        title: lessonForm.title,
        section_id: Number(lessonForm.section_id),
        lesson_type: lessonForm.lesson_type,
        content: lessonForm.description,
        duration_minutes: lessonForm.duration ? Number(lessonForm.duration) : 0,
        order_index:
          lessons.filter(
            (lesson) =>
              Number(lesson.section_id) === Number(lessonForm.section_id),
          ).length + 1,
        is_free: false,
      });

      if (videoFile) {
        newLesson = (await lessonApi.uploadVideo(
          newLesson.id,
          videoFile,
        )) as Lesson;
      }

      if (docFile) {
        newLesson = (await lessonApi.uploadDocument(
          newLesson.id,
          docFile,
        )) as Lesson;
      }

      setLessons((prev) => {
        const exists = prev.some((lesson) => lesson.id === newLesson.id);

        if (exists) {
          return prev.map((lesson) =>
            lesson.id === newLesson.id ? newLesson : lesson,
          );
        }

        return [...prev, newLesson];
      });

      toast.success("Đã thêm bài giảng!");

      setLessonForm({
        title: "",
        section_id: "",
        lesson_type: "video",
        description: "",
        duration: "",
      });

      setVideoFile(null);
      setDocFile(null);
      setShowAddLesson(false);

      await loadLessons(Number(selectedCourse));
    } catch (e: unknown) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const inputCls =
    "w-full px-3 py-2.5 rounded-xl border border-border bg-input-background outline-none focus:border-primary text-sm";

  return (
    <TeacherLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2>Quản lý bài giảng</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Thêm và quản lý bài giảng theo khóa học
          </p>
        </div>
      </div>

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
        <EmptyState title="Chọn khóa học để quản lý bài giảng" />
      ) : loading ? (
        <LoadingState />
      ) : (
        <div className="space-y-4">
          <div className="flex gap-2">
            <button
              onClick={() => setShowAddSection(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-secondary text-primary rounded-lg text-sm hover:bg-primary hover:text-white transition-colors"
            >
              <Plus className="w-4 h-4" />
              Thêm chương
            </button>

            <button
              onClick={() => {
                if (sections.length === 0) {
                  toast.error("Vui lòng thêm chương trước");
                  return;
                }

                setShowAddLesson(true);
              }}
              className="flex items-center gap-1.5 px-3 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90"
            >
              <Plus className="w-4 h-4" />
              Thêm bài giảng
            </button>
          </div>

          {showAddSection && (
            <div className="bg-card rounded-xl border border-border p-4 flex gap-3 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1.5">
                  Tên chương
                </label>

                <input
                  value={sectionTitle}
                  onChange={(e) => setSectionTitle(e.target.value)}
                  className={inputCls}
                  placeholder="Chương 1: Giới thiệu..."
                />
              </div>

              <button
                onClick={addSection}
                disabled={saving}
                className="px-4 py-2.5 bg-primary text-white rounded-xl text-sm flex items-center gap-1.5 disabled:opacity-60"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                Lưu
              </button>

              <button
                onClick={() => setShowAddSection(false)}
                className="px-4 py-2.5 border border-border rounded-xl text-sm"
              >
                Hủy
              </button>
            </div>
          )}

          {showAddLesson && (
            <form
              onSubmit={addLesson}
              className="bg-card rounded-xl border border-border p-5 space-y-4"
            >
              <h3>Thêm bài giảng mới</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    Tên bài giảng *
                  </label>

                  <input
                    required
                    value={lessonForm.title}
                    onChange={(e) =>
                      setLessonForm((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    Chương *
                  </label>

                  <select
                    required
                    value={lessonForm.section_id}
                    onChange={(e) =>
                      setLessonForm((prev) => ({
                        ...prev,
                        section_id: e.target.value,
                      }))
                    }
                    className={inputCls}
                  >
                    <option value="">-- Chọn chương --</option>

                    {sections.map((section) => (
                      <option key={section.id} value={String(section.id)}>
                        {section.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    Loại bài *
                  </label>

                  <select
                    value={lessonForm.lesson_type}
                    onChange={(e) =>
                      setLessonForm((prev) => ({
                        ...prev,
                        lesson_type: e.target.value,
                      }))
                    }
                    className={inputCls}
                  >
                    <option value="video">Video</option>
                    <option value="document">Tài liệu</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    Thời lượng (phút)
                  </label>

                  <input
                    type="number"
                    value={lessonForm.duration}
                    onChange={(e) =>
                      setLessonForm((prev) => ({
                        ...prev,
                        duration: e.target.value,
                      }))
                    }
                    className={inputCls}
                    placeholder="30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Mô tả
                </label>

                <textarea
                  rows={2}
                  value={lessonForm.description}
                  onChange={(e) =>
                    setLessonForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className={`${inputCls} resize-none`}
                />
              </div>

              {lessonForm.lesson_type === "video" && (
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    Upload Video <span className="text-destructive">*</span>
                  </label>

                  <label className="flex items-center gap-3 border-2 border-dashed border-border rounded-xl p-3 cursor-pointer hover:border-primary hover:bg-secondary/50 transition-colors">
                    <Upload className="w-5 h-5 text-muted-foreground flex-shrink-0" />

                    {videoFile ? (
                      <span className="text-sm text-primary">
                        {videoFile.name}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        Chọn file video (MP4, MOV...)
                      </span>
                    )}

                    <input
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={(e) =>
                        setVideoFile(e.target.files?.[0] || null)
                      }
                    />
                  </label>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Upload tài liệu (tuỳ chọn)
                </label>

                <label className="flex items-center gap-3 border-2 border-dashed border-border rounded-xl p-3 cursor-pointer hover:border-primary hover:bg-secondary/50 transition-colors">
                  <FileText className="w-5 h-5 text-muted-foreground flex-shrink-0" />

                  {docFile ? (
                    <span className="text-sm text-primary">{docFile.name}</span>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      Chọn PDF, DOCX...
                    </span>
                  )}

                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.pptx"
                    className="hidden"
                    onChange={(e) => setDocFile(e.target.files?.[0] || null)}
                  />
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-medium disabled:opacity-60"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  Lưu bài giảng
                </button>

                <button
                  type="button"
                  onClick={() => setShowAddLesson(false)}
                  className="px-5 py-2.5 border border-border rounded-xl text-sm"
                >
                  Hủy
                </button>
              </div>
            </form>
          )}

          {sections.length === 0 && !showAddSection ? (
            <EmptyState
              title="Chưa có chương"
              description="Thêm chương để tổ chức bài giảng"
            />
          ) : (
            <div className="space-y-3">
              {sections.map((section) => {
                const sectionLessons = lessons.filter(
                  (lesson) => Number(lesson.section_id) === Number(section.id),
                );

                return (
                  <div
                    key={section.id}
                    className="bg-card rounded-xl border border-border overflow-hidden"
                  >
                    <div className="px-4 py-3 bg-muted/50 border-b border-border">
                      <p className="font-medium text-sm">{section.title}</p>
                    </div>

                    <div className="divide-y divide-border">
                      {sectionLessons.map((lesson) => {
                        const isVideo =
                          lesson.lesson_type?.toLowerCase() === "video" ||
                          Boolean(lesson.video_url);

                        return (
                          <button
                            key={lesson.id}
                            type="button"
                            onClick={() => {
                              window.open(
                                `/learn/${selectedCourse}/${lesson.id}`,
                                "_blank",
                              );
                            }}
                            className="w-full px-4 py-3 flex items-center gap-3 text-sm text-left hover:bg-secondary transition-colors"
                          >
                            {isVideo ? (
                              <Video className="w-4 h-4 text-primary flex-shrink-0" />
                            ) : (
                              <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            )}

                            <span className="flex-1">{lesson.title}</span>

                            {lesson.duration_minutes ? (
                              <span className="text-xs text-muted-foreground">
                                {lesson.duration_minutes} phút
                              </span>
                            ) : null}
                          </button>
                        );
                      })}

                      {sectionLessons.length === 0 && (
                        <p className="px-4 py-3 text-sm text-muted-foreground">
                          Chưa có bài giảng trong chương này
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </TeacherLayout>
  );
}
