import { useEffect, useState } from 'react';
import { AdminLayout } from './AdminLayout';
import { LoadingState, EmptyState, ErrorState } from '../../components/ui/States';
import { commonApi } from '../../services/courseApi';
import { Subject } from '../../services/api';
import { BookOpen, Loader2, Plus } from 'lucide-react';
import { toast } from 'sonner';

export function AdminSubjects() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newName, setNewName] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    commonApi.subjects()
      .then(data => { setSubjects(data as Subject[]); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setSaving(true);
    try {
      const sub = await commonApi.createSubject({ name: newName });
      setSubjects(prev => [...prev, sub as Subject]);
      setNewName('');
      toast.success('Đã thêm môn học!');
    } catch (err: unknown) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h2>Danh mục môn học</h2>
        <p className="text-sm text-muted-foreground mt-1">Quản lý danh sách môn học</p>
      </div>

      <div className="max-w-lg">
        <form onSubmit={handleAdd} className="flex gap-2 mb-5">
          <input
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="Tên môn học mới..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-input-background outline-none focus:border-primary text-sm"
          />
          <button type="submit" disabled={saving || !newName.trim()} className="flex items-center gap-1.5 px-4 py-2.5 bg-primary text-white rounded-xl text-sm disabled:opacity-60">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Thêm
          </button>
        </form>

        {loading ? <LoadingState /> : error ? <ErrorState error={error} onRetry={load} /> : subjects.length === 0 ? (
          <EmptyState title="Chưa có môn học" icon={BookOpen} />
        ) : (
          <div className="bg-card rounded-xl border border-border divide-y divide-border">
            {subjects.map(s => (
              <div key={s.id} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-sm font-medium">{s.name}</p>
                </div>
                <span className="text-xs text-muted-foreground">#{s.id}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
