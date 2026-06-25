import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { TeacherLayout } from './TeacherLayout';
import { LoadingState, EmptyState, ErrorState } from '../../components/ui/States';
import { teacherApi } from '../../services/teacherApi';
import { Course, assetUrl } from '../../services/api';
import { BookOpen, Plus, Users, Video } from 'lucide-react';

const statusLabel: Record<string, { label: string; cls: string }> = {
  pending: { label: 'Chờ duyệt', cls: 'bg-yellow-100 text-yellow-700' },
  approved: { label: 'Đã duyệt', cls: 'bg-green-100 text-green-700' },
  rejected: { label: 'Bị từ chối', cls: 'bg-red-100 text-red-600' },
};

export function TeacherCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    teacherApi.myCourses()
      .then(data => { setCourses(data as Course[]); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  return (
    <TeacherLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2>Khóa học của tôi</h2>
          <p className="text-sm text-muted-foreground mt-1">Quản lý tất cả khóa học bạn đã tạo</p>
        </div>
        <Link to="/lecturer/courses/new" className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90">
          <Plus className="w-4 h-4" /> Thêm khóa học
        </Link>
      </div>

      {loading ? <LoadingState /> : error ? <ErrorState error={error} onRetry={load} /> : courses.length === 0 ? (
        <EmptyState title="Chưa có khóa học" description="Tạo khóa học đầu tiên của bạn" icon={BookOpen}
          action={<Link to="/lecturer/courses/new" className="px-4 py-2 bg-primary text-white rounded-lg text-sm">Tạo khóa học</Link>}
        />
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/50">
              <tr className="text-left text-muted-foreground">
                <th className="px-4 py-3 font-medium">Khóa học</th>
                <th className="px-4 py-3 font-medium">Giá</th>
                <th className="px-4 py-3 font-medium">Trạng thái</th>
                <th className="px-4 py-3 font-medium">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {courses.map(c => {
                const st = statusLabel[c.status] || { label: c.status, cls: 'bg-muted text-muted-foreground' };
                return (
                  <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                          {c.thumbnail_url ? (
                            <img src={assetUrl(c.thumbnail_url)} alt="" className="w-full h-full rounded-lg object-cover" />
                          ) : <BookOpen className="w-5 h-5 text-muted-foreground" />}
                        </div>
                        <div>
                          <p className="font-medium line-clamp-1">{c.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{c.short_description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-accent font-semibold">
                      {c.price === 0 ? 'Miễn phí' : c.price.toLocaleString('vi-VN') + 'đ'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${st.cls}`}>{st.label}</span>
                      {c.rejection_reason && <p className="text-xs text-red-500 mt-1">{c.rejection_reason}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link to={`/lecturer/lessons?course=${c.id}`} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-primary" title="Bài giảng">
                          <Video className="w-4 h-4" />
                        </Link>
                        <Link to={`/lecturer/students?course=${c.id}`} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-primary" title="Học sinh">
                          <Users className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </TeacherLayout>
  );
}
