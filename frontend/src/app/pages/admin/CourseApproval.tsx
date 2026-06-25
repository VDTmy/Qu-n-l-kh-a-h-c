import { useEffect, useState } from 'react';
import { AdminLayout } from './AdminLayout';
import { LoadingState, EmptyState, ErrorState } from '../../components/ui/States';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { adminApi } from '../../services/adminApi';
import { Course } from '../../services/api';
import { BookCheck, Check, Eye, X } from 'lucide-react';
import { toast } from 'sonner';

export function CourseApproval() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ type: 'approve' | 'reject'; id: number } | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const load = () => {
    setLoading(true);
    adminApi.pendingCourses()
      .then(data => { setCourses(data as Course[]); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const handleConfirm = async () => {
    if (!confirmAction) return;
    try {
      if (confirmAction.type === 'approve') {
        await adminApi.approveCourse(confirmAction.id);
        toast.success('Đã duyệt khóa học!');
      } else {
        await adminApi.rejectCourse(confirmAction.id, rejectReason);
        toast.success('Đã từ chối khóa học!');
      }
      setCourses(prev => prev.filter(c => c.id !== confirmAction.id));
      setSelectedCourse(null);
    } catch (e: unknown) {
      toast.error((e as Error).message);
    } finally {
      setConfirmOpen(false);
      setConfirmAction(null);
      setRejectReason('');
    }
  };

  const levelLabel: Record<string, string> = { beginner: 'Cơ bản', intermediate: 'Trung bình', advanced: 'Nâng cao' };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h2>Duyệt khóa học</h2>
        <p className="text-sm text-muted-foreground mt-1">Danh sách khóa học chờ phê duyệt</p>
      </div>

      {selectedCourse ? (
        <div className="max-w-2xl">
          <button onClick={() => setSelectedCourse(null)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary mb-4">← Quay lại</button>
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex gap-4 mb-4">
              {selectedCourse.thumbnail_url ? (
                <img src={selectedCourse.thumbnail_url} alt="" className="w-24 h-16 rounded-lg object-cover flex-shrink-0" />
              ) : <div className="w-24 h-16 rounded-lg bg-secondary flex-shrink-0" />}
              <div>
                <h3>{selectedCourse.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{selectedCourse.short_description}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm mb-5">
              <div><p className="text-xs text-muted-foreground">Giá</p><p className="font-medium text-accent">{selectedCourse.price === 0 ? 'Miễn phí' : selectedCourse.price.toLocaleString() + 'đ'}</p></div>
              <div><p className="text-xs text-muted-foreground">Cấp độ</p><p>{levelLabel[selectedCourse.level]}</p></div>
              {selectedCourse.teacher && <div><p className="text-xs text-muted-foreground">Giảng viên</p><p>{selectedCourse.teacher.full_name}</p></div>}
            </div>
            <p className="text-sm text-muted-foreground mb-5 whitespace-pre-wrap">{selectedCourse.full_description}</p>
            <div className="flex gap-3">
              <button onClick={() => { setConfirmAction({ type: 'approve', id: selectedCourse.id }); setConfirmOpen(true); }}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl text-sm hover:bg-green-700">
                <Check className="w-4 h-4" /> Duyệt
              </button>
              <button onClick={() => { setConfirmAction({ type: 'reject', id: selectedCourse.id }); setConfirmOpen(true); }}
                className="flex items-center gap-2 px-4 py-2 bg-destructive text-white rounded-xl text-sm hover:bg-destructive/90">
                <X className="w-4 h-4" /> Từ chối
              </button>
            </div>
          </div>
        </div>
      ) : loading ? <LoadingState /> : error ? <ErrorState error={error} onRetry={load} /> : courses.length === 0 ? (
        <EmptyState title="Không có khóa học chờ duyệt" icon={BookCheck} />
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/50">
              <tr className="text-left text-muted-foreground">
                <th className="px-4 py-3 font-medium">Khóa học</th>
                <th className="px-4 py-3 font-medium">Giảng viên</th>
                <th className="px-4 py-3 font-medium">Giá</th>
                <th className="px-4 py-3 font-medium">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {courses.map(c => (
                <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <p className="font-medium line-clamp-1">{c.title}</p>
                    <p className="text-xs text-muted-foreground">{levelLabel[c.level]}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{c.teacher?.full_name || '—'}</td>
                  <td className="px-4 py-3 text-accent font-semibold">{c.price === 0 ? 'Miễn phí' : c.price.toLocaleString() + 'đ'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setSelectedCourse(c)} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-primary"><Eye className="w-4 h-4" /></button>
                      <button onClick={() => { setConfirmAction({ type: 'approve', id: c.id }); setConfirmOpen(true); }}
                        className="p-1.5 rounded-lg hover:bg-green-50 text-muted-foreground hover:text-green-600"><Check className="w-4 h-4" /></button>
                      <button onClick={() => { setConfirmAction({ type: 'reject', id: c.id }); setConfirmOpen(true); }}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-destructive"><X className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmModal
        open={confirmOpen}
        title={confirmAction?.type === 'approve' ? 'Duyệt khóa học' : 'Từ chối khóa học'}
        message={confirmAction?.type === 'approve' ? 'Xác nhận duyệt khóa học này?' : 'Nhập lý do từ chối:'}
        confirmLabel={confirmAction?.type === 'approve' ? 'Duyệt' : 'Từ chối'}
        onConfirm={handleConfirm}
        onCancel={() => { setConfirmOpen(false); setConfirmAction(null); setRejectReason(''); }}
        danger={confirmAction?.type === 'reject'}
      >
        {confirmAction?.type === 'reject' && (
          <textarea rows={3} value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Lý do từ chối..."
            className="w-full px-3 py-2 rounded-lg border border-border text-sm outline-none focus:border-primary resize-none mt-2" />
        )}
      </ConfirmModal>
    </AdminLayout>
  );
}
