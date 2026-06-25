import { useEffect, useState } from 'react';
import { StudentLayout } from './StudentLayout';
import { LoadingState, EmptyState, ErrorState } from '../../components/ui/States';
import { notificationApi } from '../../services/studentApi';
import { Notification } from '../../services/api';
import { Bell } from 'lucide-react';
import { toast } from 'sonner';

export function StudentNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    notificationApi.mine()
      .then(data => { setNotifications(data as Notification[]); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const markRead = async (id: number) => {
    try {
      await notificationApi.read(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (e: unknown) {
      toast.error((e as Error).message);
    }
  };

  return (
    <StudentLayout>
      <div className="mb-6">
        <h2>Thông báo</h2>
        <p className="text-sm text-muted-foreground mt-1">Tất cả thông báo của bạn</p>
      </div>
      {loading ? <LoadingState /> : error ? <ErrorState error={error} onRetry={load} /> : notifications.length === 0 ? (
        <EmptyState title="Không có thông báo" icon={Bell} />
      ) : (
        <div className="space-y-3">
          {notifications.map(n => (
            <div
              key={n.id}
              className={`bg-card rounded-xl border p-4 flex items-start gap-3 cursor-pointer transition-colors ${
                n.is_read ? 'border-border opacity-70' : 'border-primary/30 bg-blue-50/50'
              }`}
              onClick={() => !n.is_read && markRead(n.id)}
            >
              <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${n.is_read ? 'bg-muted-foreground' : 'bg-primary'}`} />
              <div className="flex-1">
                {n.title && <p className="text-sm font-medium mb-0.5">{n.title}</p>}
                <p className="text-sm text-muted-foreground">{n.message}</p>
              </div>
              {!n.is_read && <span className="text-xs text-primary font-medium">Đánh dấu đã đọc</span>}
            </div>
          ))}
        </div>
      )}
    </StudentLayout>
  );
}
