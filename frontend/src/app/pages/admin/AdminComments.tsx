import { useEffect, useState } from 'react';
import { AdminLayout } from './AdminLayout';
import { LoadingState, EmptyState, ErrorState } from '../../components/ui/States';
import { adminApi } from '../../services/adminApi';
import { Comment } from '../../services/api';
import { MessageSquare, Pin, PinOff, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export function AdminComments() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    adminApi.comments()
      .then(data => { setComments(data as Comment[]); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const handlePin = async (id: number, pinned: boolean) => {
    try {
      if (pinned) await adminApi.unpinComment(id);
      else await adminApi.pinComment(id);
      setComments(prev => prev.map(c => c.id === id ? { ...c, is_pinned: !pinned } : c));
      toast.success(pinned ? 'Đã bỏ ghim' : 'Đã ghim bình luận');
    } catch (e: unknown) {
      toast.error((e as Error).message);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await adminApi.deleteComment(id);
      setComments(prev => prev.filter(c => c.id !== id));
      toast.success('Đã xóa bình luận');
    } catch (e: unknown) {
      toast.error((e as Error).message);
    }
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h2>Quản lý bình luận</h2>
        <p className="text-sm text-muted-foreground mt-1">Xem và ghim bình luận</p>
      </div>

      {loading ? <LoadingState /> : error ? <ErrorState error={error} onRetry={load} /> : comments.length === 0 ? (
        <EmptyState title="Không có bình luận" icon={MessageSquare} />
      ) : (
        <div className="space-y-3">
          {comments.map(c => (
            <div key={c.id} className={`bg-card rounded-xl border p-4 flex items-start justify-between gap-4 ${c.is_pinned ? 'border-accent' : 'border-border'}`}>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium">{c.student_name || 'Học viên'}</p>
                  {c.is_pinned && <span className="text-xs bg-orange-100 text-accent px-2 py-0.5 rounded-full">Đã ghim</span>}
                </div>
                <p className="text-sm text-muted-foreground">{c.content}</p>
                {c.created_at && <p className="text-xs text-muted-foreground mt-1">{new Date(c.created_at).toLocaleString('vi-VN')}</p>}
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => handlePin(c.id, !!c.is_pinned)}
                  className={`p-2 rounded-lg ${c.is_pinned ? 'text-accent hover:bg-orange-50' : 'text-muted-foreground hover:bg-secondary hover:text-primary'}`}
                  title={c.is_pinned ? 'Bỏ ghim' : 'Ghim'}
                >
                  {c.is_pinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => handleDelete(c.id)}
                  className="p-2 rounded-lg text-muted-foreground hover:bg-red-50 hover:text-destructive"
                  title="Xóa bình luận"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
