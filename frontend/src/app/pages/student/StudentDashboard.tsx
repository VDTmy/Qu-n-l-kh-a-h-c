import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { StudentLayout } from './StudentLayout';
import { LoadingState, ErrorState, StatCard } from '../../components/ui/States';
import { studentApi } from '../../services/studentApi';
import { Award, BookOpen, Target, TrendingUp } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface Stats {
  total_courses: number;
  avg_progress: number;
  avg_score: number;
  certificates: number;
}

export function StudentDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    studentApi.myStatistics()
      .then(s => { setStats(s as Stats); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  return (
    <StudentLayout>
      <div className="mb-6">
        <h2>Xin chào, {user?.full_name}! 👋</h2>
        <p className="text-sm text-muted-foreground mt-1">Tiếp tục học tập để đạt mục tiêu của bạn</p>
      </div>

      {loading ? <LoadingState /> : error ? (
        <ErrorState error={error} onRetry={() => location.reload()} />
      ) : stats ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Khóa học đã đăng ký" value={stats.total_courses} icon={BookOpen} color="primary" />
          <StatCard label="Tiến độ trung bình" value={`${Math.round(stats.avg_progress)}%`} icon={TrendingUp} color="success" />
          <StatCard label="Điểm trung bình" value={stats.avg_score?.toFixed(1) || '—'} icon={Target} color="accent" />
          <StatCard label="Chứng chỉ" value={stats.certificates} icon={Award} color="warning" />
        </div>
      ) : null}

      <div className="grid md:grid-cols-2 gap-4">
        <Link to="/student/courses" className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-all flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="font-semibold">Khóa học của tôi</p>
            <p className="text-sm text-muted-foreground mt-0.5">Tiếp tục học từ bài đang dở</p>
          </div>
        </Link>
        <Link to="/courses" className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-all flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center">
            <Target className="w-6 h-6 text-accent" />
          </div>
          <div>
            <p className="font-semibold">Khám phá khóa học</p>
            <p className="text-sm text-muted-foreground mt-0.5">Tìm khóa học mới phù hợp</p>
          </div>
        </Link>
      </div>
    </StudentLayout>
  );
}
