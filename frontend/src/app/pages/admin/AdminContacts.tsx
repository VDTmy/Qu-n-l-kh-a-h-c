import { useEffect, useState } from 'react';
import { AdminLayout } from './AdminLayout';
import { LoadingState, EmptyState, ErrorState } from '../../components/ui/States';
import { contactApi } from '../../services/adminApi';
import { Contact } from '../../services/api';
import { Check, Phone } from 'lucide-react';
import { toast } from 'sonner';

export function AdminContacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  const load = () => {
    setLoading(true);
    contactApi.list()
      .then(data => { setContacts(data as Contact[]); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const handleProcess = async (id: number) => {
    try {
      await contactApi.process(id);
      setContacts(prev => prev.map(c => c.id === id ? { ...c, status: 'processed' } : c));
      if (selectedContact?.id === id) setSelectedContact(c => c ? { ...c, status: 'processed' } : c);
      toast.success('Đã xử lý liên hệ!');
    } catch (e: unknown) {
      toast.error((e as Error).message);
    }
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h2>Quản lý liên hệ</h2>
        <p className="text-sm text-muted-foreground mt-1">Danh sách liên hệ từ người dùng</p>
      </div>

      {selectedContact ? (
        <div className="max-w-lg">
          <button onClick={() => setSelectedContact(null)} className="text-sm text-muted-foreground hover:text-primary mb-4">← Quay lại</button>
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="space-y-3 mb-5">
              <div><p className="text-xs text-muted-foreground">Họ tên</p><p className="font-medium">{selectedContact.full_name}</p></div>
              <div><p className="text-xs text-muted-foreground">Email</p><p className="text-sm">{selectedContact.email}</p></div>
              {selectedContact.phone && <div><p className="text-xs text-muted-foreground">Điện thoại</p><p className="text-sm">{selectedContact.phone}</p></div>}
              <div><p className="text-xs text-muted-foreground">Nội dung</p><p className="text-sm leading-relaxed">{selectedContact.message}</p></div>
              <div>
                <p className="text-xs text-muted-foreground">Trạng thái</p>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${selectedContact.status === 'processed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {selectedContact.status === 'processed' ? 'Đã xử lý' : 'Chưa xử lý'}
                </span>
              </div>
            </div>
            {selectedContact.status !== 'processed' && (
              <button onClick={() => handleProcess(selectedContact.id)} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl text-sm hover:bg-green-700">
                <Check className="w-4 h-4" /> Đánh dấu đã xử lý
              </button>
            )}
          </div>
        </div>
      ) : loading ? <LoadingState /> : error ? <ErrorState error={error} onRetry={load} /> : contacts.length === 0 ? (
        <EmptyState title="Không có liên hệ" icon={Phone} />
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/50">
              <tr className="text-left text-muted-foreground">
                <th className="px-4 py-3 font-medium">Người liên hệ</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Trạng thái</th>
                <th className="px-4 py-3 font-medium">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map(c => (
                <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <p className="font-medium">{c.full_name}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">{c.message}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{c.email}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.status === 'processed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {c.status === 'processed' ? 'Đã xử lý' : 'Chưa xử lý'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => setSelectedContact(c)} className="text-xs text-primary hover:underline">Xem</button>
                      {c.status !== 'processed' && (
                        <button onClick={() => handleProcess(c.id)} className="text-xs text-green-600 hover:underline">Xử lý</button>
                      )}
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
