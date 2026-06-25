import { useEffect, useState } from 'react';
import { StudentLayout } from './StudentLayout';
import { LoadingState, EmptyState, ErrorState } from '../../components/ui/States';
import { enrollmentApi } from '../../services/studentApi';
import { Enrollment } from '../../services/api';
import { GraduationCap } from 'lucide-react';

interface TeacherInfo { id: number; full_name: string; courses: string[] }

export function StudentLecturers() {
  const [teachers, setTeachers] = useState<TeacherInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    enrollmentApi.myCourses()
      .then(data => {
        const enrollments = data as Enrollment[];
        const map = new Map<number, TeacherInfo>();
        enrollments.forEach(e => {
          if (!e.course?.teacher_id) return;
          const tid = e.course.teacher_id;
          if (!map.has(tid)) {
            map.set(tid, {
              id: tid,
              full_name: e.course.teacher?.full_name || 'Giảng viên',
              courses: [],
            });
          }
          map.get(tid)!.courses.push(e.course.title);
        });
        setTeachers(Array.from(map.values()));
        setLoading(false);
      })
      .catch(e => { setError(e.message); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  return (
    <StudentLayout>
      <div className="mb-6">
        <h2>Giảng viên của tôi</h2>
        <p className="text-sm text-muted-foreground mt-1">Giảng viên dạy các khóa học bạn đã đăng ký</p>
      </div>
      {loading ? <LoadingState /> : error ? <ErrorState error={error} onRetry={load} /> : teachers.length === 0 ? (
        <EmptyState title="Chưa có giảng viên" description="Đăng ký khóa học để gặp giảng viên" icon={GraduationCap} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {teachers.map(t => (
            <div key={t.id} className="bg-card rounded-xl border border-border p-5 flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                {t.full_name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold">{t.full_name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{t.courses.length} khóa học</p>
                <div className="mt-2 space-y-1">
                  {t.courses.slice(0, 2).map((c, i) => (
                    <p key={i} className="text-xs text-muted-foreground truncate">• {c}</p>
                  ))}
                  {t.courses.length > 2 && <p className="text-xs text-primary">+{t.courses.length - 2} khóa nữa</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </StudentLayout>
  );
}
