import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { teacherApi } from '../../services/teacherApi';
import { BookOpen, Clock, Loader2, Upload, XCircle } from 'lucide-react';
import { toast } from 'sonner';

function StatusShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="flex items-center gap-2 mb-8">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <BookOpen className="w-5 h-5 text-white" />
        </div>
        <span className="font-bold text-xl text-primary">EduMaster</span>
      </div>
      {children}
    </div>
  );
}

export function TeacherPendingPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <StatusShell>
      <div className="bg-card rounded-2xl border border-border shadow-sm max-w-md w-full p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-5">
          <Clock className="w-8 h-8 text-yellow-600" />
        </div>
        <h2 className="mb-2">Hồ sơ đang chờ duyệt</h2>
        <p className="text-muted-foreground text-sm leading-relaxed mb-6">
          Admin đang kiểm tra CV và thông tin chuyên môn của bạn.<br />
          Bạn sẽ nhận thông báo khi hồ sơ được phê duyệt.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/')}
            className="flex-1 py-2.5 border border-border rounded-xl text-sm font-medium hover:bg-muted transition-colors"
          >
            Quay về trang chủ
          </button>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="flex-1 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Đăng xuất
          </button>
        </div>
      </div>
    </StatusShell>
  );
}

export function TeacherRejectedPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <StatusShell>
      <div className="bg-card rounded-2xl border border-border shadow-sm max-w-md w-full p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-5">
          <XCircle className="w-8 h-8 text-destructive" />
        </div>
        <h2 className="mb-2">Hồ sơ bị từ chối</h2>
        <p className="text-muted-foreground text-sm leading-relaxed mb-6">
          Vui lòng cập nhật lại hồ sơ hoặc liên hệ Admin để biết thêm chi tiết.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/teacher-complete-profile')}
            className="flex-1 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Cập nhật hồ sơ
          </button>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="flex-1 py-2.5 border border-border rounded-xl text-sm font-medium hover:bg-muted transition-colors"
          >
            Đăng xuất
          </button>
        </div>
      </div>
    </StatusShell>
  );
}

export function TeacherCompleteProfilePage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState('');
  const [expertise, setExpertise] = useState('');
  const [experience, setExperience] = useState('');
  const [bio, setBio] = useState('');
  const [cvFile, setCvFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cvFile) { toast.error('Vui lòng upload CV'); return; }
    setLoading(true);
    try {
      await teacherApi.createProfile({ phone, expertise, experience, bio });
      await teacherApi.uploadCV(cvFile);
      toast.success('Đã gửi hồ sơ xét duyệt!');
      logout();
      navigate('/login');
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Gửi thất bại');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full px-4 py-2.5 rounded-xl border border-border bg-input-background outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm";

  return (
    <StatusShell>
      <div className="bg-card rounded-2xl border border-border shadow-sm max-w-lg w-full p-8">
        <h2 className="mb-2 text-center">Hoàn thiện hồ sơ giảng viên</h2>
        <p className="text-sm text-muted-foreground text-center mb-6">
          Bạn cần hoàn thiện hồ sơ trước khi sử dụng hệ thống.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Số điện thoại</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="0912345678" className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Chuyên môn <span className="text-destructive">*</span></label>
            <input required value={expertise} onChange={e => setExpertise(e.target.value)} placeholder="Toán học, Vật lý..." className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Kinh nghiệm</label>
            <input value={experience} onChange={e => setExperience(e.target.value)} placeholder="5 năm kinh nghiệm giảng dạy..." className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Giới thiệu bản thân</label>
            <textarea rows={3} value={bio} onChange={e => setBio(e.target.value)} className={`${inputCls} resize-none`} placeholder="Mô tả về bản thân và phương pháp giảng dạy..." />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Upload CV <span className="text-destructive">*</span></label>
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-4 cursor-pointer hover:border-primary hover:bg-secondary transition-colors">
              <Upload className="w-6 h-6 text-muted-foreground mb-2" />
              {cvFile
                ? <span className="text-sm text-primary font-medium">{cvFile.name}</span>
                : <span className="text-sm text-muted-foreground">Chọn file PDF, DOCX</span>
              }
              <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={e => setCvFile(e.target.files?.[0] || null)} />
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 disabled:opacity-60">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Gửi hồ sơ xét duyệt
            </button>
            <button type="button" onClick={() => { logout(); navigate('/login'); }} className="px-4 py-2.5 border border-border rounded-xl text-sm hover:bg-muted">
              Đăng xuất
            </button>
          </div>
        </form>
      </div>
    </StatusShell>
  );
}
