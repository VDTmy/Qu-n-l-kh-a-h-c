import { useState } from 'react';
import { PublicLayout } from '../../components/layout/PublicLayout';
import { contactApi } from '../../services/adminApi';
import { Loader2, Mail, MapPin, Phone } from 'lucide-react';
import { toast } from 'sonner';

export function ContactPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await contactApi.create({ full_name: fullName, email, phone, message });
      toast.success('Gửi liên hệ thành công! Chúng tôi sẽ phản hồi trong thời gian sớm nhất.');
      setFullName(''); setEmail(''); setPhone(''); setMessage('');
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Gửi thất bại');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full px-4 py-2.5 rounded-xl border border-border bg-input-background outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm";

  return (
    <PublicLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <div className="text-center mb-10">
          <h1>Liên hệ với chúng tôi</h1>
          <p className="text-muted-foreground mt-2">Đội ngũ hỗ trợ sẽ phản hồi trong vòng 24 giờ</p>
        </div>

        <div className="grid md:grid-cols-2 gap-10">
          <div>
            <h3 className="mb-4">Thông tin liên hệ</h3>
            <div className="space-y-4">
              {[
                { icon: Phone, label: 'Điện thoại', value: '1900 1234' },
                { icon: Mail, label: 'Email', value: 'info@edumaster.vn' },
                { icon: MapPin, label: 'Địa chỉ', value: '123 Đường ABC, Quận 1, TP.HCM' },
              ].map(c => {
                const Icon = c.icon;
                return (
                  <div key={c.label} className="flex items-start gap-4 p-4 bg-card rounded-xl border border-border">
                    <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{c.label}</p>
                      <p className="text-sm text-muted-foreground">{c.value}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-6 p-4 bg-secondary rounded-xl">
              <p className="text-sm font-medium text-primary mb-1">Giờ làm việc</p>
              <p className="text-sm text-muted-foreground">Thứ 2 – Thứ 6: 8:00 – 17:30</p>
              <p className="text-sm text-muted-foreground">Thứ 7: 8:00 – 12:00</p>
            </div>
          </div>

          <div className="bg-card rounded-2xl border border-border p-6">
            <h3 className="mb-4">Gửi tin nhắn</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Họ và tên</label>
                <input required value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Nguyễn Văn A" className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Email</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="email@example.com" className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Số điện thoại</label>
                <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="0912345678" className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Nội dung</label>
                <textarea required rows={4} value={message} onChange={e => setMessage(e.target.value)} placeholder="Nhập nội dung liên hệ..." className={`${inputCls} resize-none`} />
              </div>
              <button type="submit" disabled={loading} className="w-full py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 disabled:opacity-60 flex items-center justify-center gap-2">
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Gửi liên hệ
              </button>
            </form>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
