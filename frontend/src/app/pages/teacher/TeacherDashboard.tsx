import { useEffect, useState } from 'react';
import { TeacherLayout } from './TeacherLayout';
import { LoadingState, ErrorState, StatCard } from '../../components/ui/States';
import { teacherApi } from '../../services/teacherApi';
import { BookOpen, GraduationCap, TrendingUp, Users } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function TeacherDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Record<string, number> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    teacherApi.myStatistics()
      .then(s => { setStats(s as Record<string, number>); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  return (
    <TeacherLayout>
      <div className="mb-6">
        <h2>Xin chào, {user?.full_name}!</h2>
        <p className="text-sm text-muted-foreground mt-1">Tổng quan hoạt động giảng dạy của bạn</p>
      </div>
      {loading ? <LoadingState /> : error ? <ErrorState error={error} onRetry={() => location.reload()} /> : stats ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Tổng khóa học" value={stats.total_courses || 0} icon={BookOpen} color="primary" />
          <StatCard label="Tổng học viên" value={stats.total_students || 0} icon={Users} color="accent" />
          <StatCard label="Bài kiểm tra" value={stats.total_exams || 0} icon={TrendingUp} color="success" />
          <StatCard label="Đánh giá TB" value={(stats.avg_rating || 0).toFixed(1)} icon={GraduationCap} color="warning" />
        </div>
      ) : null}
    </TeacherLayout>
  );
}
