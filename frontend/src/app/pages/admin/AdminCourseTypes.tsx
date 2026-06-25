import { useEffect, useState } from 'react';
import { AdminLayout } from './AdminLayout';
import { LoadingState, EmptyState, ErrorState } from '../../components/ui/States';
import { courseTypeApi } from '../../services/courseApi';
import { CourseType } from '../../services/api';
import { Loader2, Plus, Tag } from 'lucide-react';
import { toast } from 'sonner';

export function AdminCourseTypes() {
  const [types, setTypes] = useState<CourseType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', requires_grade: false });
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    courseTypeApi.list()
      .then(data => { setTypes(data as CourseType[]); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const t = await courseTypeApi.create(form);
      setTypes(prev => [...prev, t as CourseType]);
      setForm({ name: '', requires_grade: false });
      toast.success('Đã thêm loại khóa học!');
    } catch (err: unknown) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h2>Loại khóa học</h2>
        <p className="text-sm text-muted-foreground mt-1">Quản lý loại khóa học và cài đặt yêu cầu lớp</p>
      </div>

      <div className="max-w-lg">
        <form onSubmit={handleAdd} className="bg-card rounded-xl border border-border p-5 mb-5 space-y-3">
          <h3>Thêm loại mới</h3>
          <div>
            <label className="block text-sm font-medium mb-1">Tên loại khóa học *</label>
            <input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="VD: Luyện thi THPT QG, Chương trình THCS..."
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-input-background outline-none focus:border-primary text-sm" />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="req_grade" checked={form.requires_grade} onChange={e => setForm(p => ({ ...p, requires_grade: e.target.checked }))} className="w-4 h-4 accent-primary" />
            <label htmlFor="req_grade" className="text-sm">Yêu cầu chọn lớp (<code className="text-xs">requires_grade = true</code>)</label>
          </div>
          <button type="submit" disabled={saving || !form.name.trim()} className="flex items-center gap-1.5 px-4 py-2.5 bg-primary text-white rounded-xl text-sm disabled:opacity-60">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Thêm
          </button>
        </form>

        {loading ? <LoadingState /> : error ? <ErrorState error={error} onRetry={load} /> : types.length === 0 ? (
          <EmptyState title="Chưa có loại khóa học" icon={Tag} />
        ) : (
          <div className="bg-card rounded-xl border border-border divide-y divide-border">
            {types.map(t => (
              <div key={t.id} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                    <Tag className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{t.name}</p>
                    <p className="text-xs text-muted-foreground">requires_grade: {t.requires_grade ? 'Có' : 'Không'}</p>
                  </div>
                </div>
                {t.requires_grade && (
                  <span className="text-xs bg-blue-100 text-primary px-2 py-0.5 rounded-full">Cần chọn lớp</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
