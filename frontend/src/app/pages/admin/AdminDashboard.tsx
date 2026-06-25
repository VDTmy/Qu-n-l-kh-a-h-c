import { useEffect, useState } from 'react';
import { AdminLayout } from './AdminLayout';
import { LoadingState, ErrorState, StatCard } from '../../components/ui/States';
import { adminApi } from '../../services/adminApi';
import { BookCheck, BookOpen, GraduationCap, Users } from 'lucide-react';

export function AdminDashboard() {
  const [stats, setStats] = useState<Record<string, number> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    adminApi.dashboard()
      .then(s => { setStats(s as Record<string, number>); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  return (
    <AdminLayout>
      <div className="mb-6">
        <h2>Dashboard Admin</h2>
        <p className="text-sm text-muted-foreground mt-1">Tổng quan hệ thống EduMaster</p>
      </div>

      {loading ? <LoadingState /> : error ? <ErrorState error={error} onRetry={() => location.reload()} /> : stats ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Tổng người dùng" value={stats.total_users || 0} icon={Users} color="primary" />
          <StatCard label="Tổng khóa học" value={stats.total_courses || 0} icon={BookOpen} color="accent" />
          <StatCard label="Chờ duyệt GV" value={stats.pending_teachers || 0} icon={GraduationCap} color="warning" />
          <StatCard label="Chờ duyệt KH" value={stats.pending_courses || 0} icon={BookCheck} color="success" />
        </div>
      ) : null}
    </AdminLayout>
  );
}
