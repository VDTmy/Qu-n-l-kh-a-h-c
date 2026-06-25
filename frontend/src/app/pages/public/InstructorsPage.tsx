import { useEffect, useState } from 'react';
import { PublicLayout } from '../../components/layout/PublicLayout';
import { LoadingState, EmptyState } from '../../components/ui/States';
import { studentApi } from '../../services/studentApi';
import { Enrollment } from '../../services/api';
import { GraduationCap } from 'lucide-react';

interface TeacherInfo {
  id: number;
  full_name: string;
  courses: number;
}

export function InstructorsPage() {
  const [teachers, setTeachers] = useState<TeacherInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Derive teachers from public course list
    import('../../services/courseApi').then(({ courseApi }) => {
      courseApi.list().then(courses => {
        const map = new Map<number, TeacherInfo>();
        (courses as import('../../services/api').Course[])
          .filter(c => c.status === 'approved' && c.teacher)
          .forEach(c => {
            if (!map.has(c.teacher_id)) {
              map.set(c.teacher_id, { id: c.teacher_id, full_name: c.teacher!.full_name, courses: 0 });
            }
            map.get(c.teacher_id)!.courses++;
          });
        setTeachers(Array.from(map.values()));
        setLoading(false);
      }).catch(() => setLoading(false));
    });
  }, []);

  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <h1>Đội ngũ giảng viên</h1>
          <p className="text-sm text-muted-foreground mt-1">Những giảng viên hàng đầu, giàu kinh nghiệm</p>
        </div>
        {loading ? <LoadingState /> : teachers.length === 0 ? (
          <EmptyState title="Chưa có giảng viên" icon={GraduationCap} />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {teachers.map(t => (
              <div key={t.id} className="bg-card rounded-xl border border-border p-5 text-center hover:shadow-md transition-all">
                <div className="w-16 h-16 rounded-full bg-primary mx-auto mb-3 flex items-center justify-center text-white text-xl font-bold">
                  {t.full_name.charAt(0)}
                </div>
                <p className="font-semibold text-foreground">{t.full_name}</p>
                <p className="text-xs text-muted-foreground mt-1">{t.courses} khóa học</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
