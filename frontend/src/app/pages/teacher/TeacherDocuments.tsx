import { useEffect, useState } from 'react';
import { TeacherLayout } from './TeacherLayout';
import { EmptyState, LoadingState } from '../../components/ui/States';
import { teacherApi } from '../../services/teacherApi';
import { lessonApi } from '../../services/lessonApi';
import { Course, Lesson } from '../../services/api';
import { FileText, Loader2, Upload } from 'lucide-react';
import { toast } from 'sonner';

export function TeacherDocuments() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedLesson, setSelectedLesson] = useState('');
  const [docFile, setDocFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    teacherApi.myCourses().then(data => setCourses(data as Course[])).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedCourse) return;
    lessonApi.byCourse(Number(selectedCourse)).then(data => setLessons(data as Lesson[])).catch(() => {});
  }, [selectedCourse]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLesson || !docFile) { toast.error('Chọn bài giảng và file tài liệu'); return; }
    setUploading(true);
    try {
      await lessonApi.uploadDocument(Number(selectedLesson), docFile);
      toast.success('Upload tài liệu thành công!');
      setDocFile(null); setSelectedLesson('');
    } catch (err: unknown) {
      toast.error((err as Error).message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <TeacherLayout>
      <div className="mb-6">
        <h2>Quản lý tài liệu</h2>
        <p className="text-sm text-muted-foreground mt-1">Upload tài liệu bổ sung cho bài giảng</p>
      </div>

      <div className="max-w-lg bg-card rounded-xl border border-border p-6">
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Chọn khóa học</label>
            <select value={selectedCourse} onChange={e => { setSelectedCourse(e.target.value); setSelectedLesson(''); }}
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-input-background outline-none focus:border-primary text-sm">
              <option value="">-- Chọn khóa học --</option>
              {courses.map(c => <option key={c.id} value={String(c.id)}>{c.title}</option>)}
            </select>
          </div>
          {selectedCourse && (
            <div>
              <label className="block text-sm font-medium mb-1.5">Chọn bài giảng</label>
              <select value={selectedLesson} onChange={e => setSelectedLesson(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-input-background outline-none focus:border-primary text-sm">
                <option value="">-- Chọn bài giảng --</option>
                {lessons.map(l => <option key={l.id} value={String(l.id)}>{l.title}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1.5">File tài liệu <span className="text-destructive">*</span></label>
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-5 cursor-pointer hover:border-primary hover:bg-secondary/50 transition-colors">
              <Upload className="w-8 h-8 text-muted-foreground mb-2" />
              {docFile ? (
                <span className="text-sm text-primary font-medium">{docFile.name}</span>
              ) : (
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Chọn file tài liệu</p>
                  <p className="text-xs text-muted-foreground mt-1">PDF, DOCX, PPTX</p>
                </div>
              )}
              <input type="file" accept=".pdf,.doc,.docx,.pptx" className="hidden" onChange={e => setDocFile(e.target.files?.[0] || null)} />
            </label>
          </div>
          <button type="submit" disabled={uploading || !selectedLesson || !docFile}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 disabled:opacity-60">
            {uploading && <Loader2 className="w-4 h-4 animate-spin" />}
            Upload tài liệu
          </button>
        </form>
      </div>
    </TeacherLayout>
  );
}
