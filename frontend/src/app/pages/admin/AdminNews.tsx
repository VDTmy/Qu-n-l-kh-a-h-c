import { useEffect, useState } from 'react';
import { AdminLayout } from './AdminLayout';
import { LoadingState, EmptyState, ErrorState } from '../../components/ui/States';
import { newsApi } from '../../services/adminApi';
import { NewsArticle } from '../../services/api';
import { Eye, EyeOff, Loader2, Newspaper, Pencil, Plus } from 'lucide-react';
import { toast } from 'sonner';

export function AdminNews() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<NewsArticle | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({ title: '', summary: '', content: '', category: '', is_published: true });

  const load = () => {
    setLoading(true);
    newsApi.list()
      .then(data => { setArticles(data as NewsArticle[]); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const openEdit = (a: NewsArticle) => {
    setEditing(a);
    setForm({ title: a.title, summary: a.summary || '', content: a.content, category: a.category || '', is_published: a.is_published });
    setShowForm(true);
  };

  const openNew = () => {
    setEditing(null);
    setForm({ title: '', summary: '', content: '', category: '', is_published: true });
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        const updated = await newsApi.update(editing.id, form);
        setArticles(prev => prev.map(a => a.id === editing.id ? updated as NewsArticle : a));
        toast.success('Đã cập nhật bài viết!');
      } else {
        const created = await newsApi.create(form);
        setArticles(prev => [created as NewsArticle, ...prev]);
        toast.success('Đã tạo bài viết!');
      }
      setShowForm(false);
    } catch (err: unknown) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleHide = async (id: number) => {
    try {
      await newsApi.hide(id);
      setArticles(prev => prev.filter(a => a.id !== id));
      toast.success('Đã ẩn bài viết!');
    } catch (err: unknown) {
      toast.error((err as Error).message);
    }
  };

  const inputCls = "w-full px-3 py-2.5 rounded-xl border border-border bg-input-background outline-none focus:border-primary text-sm";

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2>Quản lý tin tức</h2>
          <p className="text-sm text-muted-foreground mt-1">Tạo và quản lý bài viết tin tức</p>
        </div>
        {!showForm && (
          <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm hover:bg-primary/90">
            <Plus className="w-4 h-4" /> Thêm bài viết
          </button>
        )}
      </div>

      {showForm ? (
        <form onSubmit={handleSave} className="max-w-2xl bg-card rounded-xl border border-border p-6 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3>{editing ? 'Chỉnh sửa bài viết' : 'Thêm bài viết mới'}</h3>
            <button type="button" onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground text-sm">Hủy</button>
          </div>
          <div><label className="block text-sm font-medium mb-1">Tiêu đề *</label><input required value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className={inputCls} /></div>
          <div><label className="block text-sm font-medium mb-1">Danh mục</label><input value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className={inputCls} placeholder="Giáo dục, Kỹ năng..." /></div>
          <div><label className="block text-sm font-medium mb-1">Tóm tắt</label><textarea rows={2} value={form.summary} onChange={e => setForm(p => ({ ...p, summary: e.target.value }))} className={`${inputCls} resize-none`} /></div>
          <div><label className="block text-sm font-medium mb-1">Nội dung *</label><textarea required rows={6} value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} className={`${inputCls} resize-none`} /></div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="published" checked={form.is_published} onChange={e => setForm(p => ({ ...p, is_published: e.target.checked }))} className="w-4 h-4 accent-primary" />
            <label htmlFor="published" className="text-sm">Xuất bản ngay</label>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-medium disabled:opacity-60">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />} Lưu
            </button>
          </div>
        </form>
      ) : loading ? <LoadingState /> : error ? <ErrorState error={error} onRetry={load} /> : articles.length === 0 ? (
        <EmptyState title="Chưa có bài viết" icon={Newspaper} />
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/50">
              <tr className="text-left text-muted-foreground">
                <th className="px-4 py-3 font-medium">Tiêu đề</th>
                <th className="px-4 py-3 font-medium">Danh mục</th>
                <th className="px-4 py-3 font-medium">Trạng thái</th>
                <th className="px-4 py-3 font-medium">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {articles.map(a => (
                <tr key={a.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <p className="font-medium line-clamp-1">{a.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">{a.summary}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{a.category || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${a.is_published ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>
                      {a.is_published ? 'Đã xuất bản' : 'Bản nháp'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(a)} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-primary"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => handleHide(a.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-destructive" title="Ẩn bài viết"><EyeOff className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}
