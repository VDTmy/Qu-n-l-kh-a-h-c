import { useEffect, useState } from 'react';
import { TeacherLayout } from './TeacherLayout';
import { LoadingState, EmptyState, ErrorState } from '../../components/ui/States';
import { teacherApi } from '../../services/teacherApi';
import { commentApi } from '../../services/studentApi';
import { Course } from '../../services/api';
import { MessageSquare } from 'lucide-react';

export function TeacherComments() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [comments, setComments] = useState<unknown[]>([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    teacherApi.myCourses().then(data => setCourses(data as Course[])).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedCourse) return;
    setLoading(true);
    commentApi.byCourse(Number(selectedCourse))
      .then(data => { setComments(data); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [selectedCourse]);

  return (
    <TeacherLayout>
      <div className="mb-6">
        <h2>Bình luận / Phản hồi</h2>
        <p className="text-sm text-muted-foreground mt-1">Xem phản hồi từ học sinh</p>
      </div>

      <div className="mb-5">
        <label className="block text-sm font-medium mb-1.5">Chọn khóa học</label>
        <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)} className="px-3 py-2.5 rounded-xl border border-border bg-white text-sm outline-none w-full max-w-xs">
          <option value="">-- Chọn khóa học --</option>
          {courses.map(c => <option key={c.id} value={String(c.id)}>{c.title}</option>)}
        </select>
      </div>

      {!selectedCourse ? <EmptyState title="Chọn khóa học để xem bình luận" icon={MessageSquare} /> :
       loading ? <LoadingState /> :
       error ? <ErrorState error={error} onRetry={() => setSelectedCourse(selectedCourse)} /> :
       comments.length === 0 ? <EmptyState title="Chưa có bình luận" icon={MessageSquare} /> : (
        <div className="space-y-3">
          {(comments as Record<string, unknown>[]).map((c, i) => (
            <div key={i} className={`bg-card rounded-xl border p-4 ${c.is_pinned ? 'border-accent' : 'border-border'}`}>
              <div className="flex items-start justify-between mb-2">
                <p className="text-sm font-medium">{String(c.student_name || 'Học viên')}</p>
                {c.is_pinned && <span className="text-xs bg-orange-100 text-accent px-2 py-0.5 rounded-full">Đã ghim</span>}
              </div>
              <p className="text-sm text-muted-foreground">{String(c.content)}</p>
              {c.created_at && <p className="text-xs text-muted-foreground mt-2">{new Date(String(c.created_at)).toLocaleString('vi-VN')}</p>}
            </div>
          ))}
        </div>
       )}
    </TeacherLayout>
  );
}
