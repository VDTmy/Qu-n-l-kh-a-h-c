import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { BookOpen, Eye, EyeOff, Loader2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { authApi } from '../../services/authApi';
import { teacherApi } from '../../services/teacherApi';

type Tab = 'student' | 'teacher';

export function RegisterPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('student');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  // Shared
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');

  // Teacher-specific
  const [phone, setPhone] = useState('');
  const [expertise, setExpertise] = useState('');
  const [experience, setExperience] = useState('');
  const [bio, setBio] = useState('');
  const [cvFile, setCvFile] = useState<File | null>(null);

  const handleSubmitStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPw) { toast.error('Mật khẩu xác nhận không khớp'); return; }
    setLoading(true);
    try {
      await authApi.register({ full_name: fullName, email, password, role: 'student' });
      toast.success('Đăng ký thành công! Vui lòng đăng nhập.');
      navigate('/login');
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPw) { toast.error('Mật khẩu xác nhận không khớp'); return; }
    if (!cvFile) { toast.error('Vui lòng upload CV'); return; }
    setLoading(true);
    try {
      // Register
      await authApi.register({ full_name: fullName, email, password, role: 'teacher', phone });
      // Login to get token
      const { access_token } = await authApi.login(email, password);
      localStorage.setItem('access_token', access_token);
      // Create profile
      await teacherApi.createProfile({ phone, expertise, experience, bio });
      // Upload CV
      await teacherApi.uploadCV(cvFile);
      // Logout
      localStorage.removeItem('access_token');
      toast.success('Đăng ký thành công! Hồ sơ của bạn đang chờ admin duyệt.');
      navigate('/teacher-pending');
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Đăng ký thất bại');
      localStorage.removeItem('access_token');
    } finally {
      setLoading(false);
    }
  };

  const commonFields = (
    <>
      <div>
        <label className="block text-sm font-medium mb-1.5">Họ và tên</label>
        <input required value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Nguyễn Văn A"
          className="w-full px-4 py-2.5 rounded-xl border border-border bg-input-background outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1.5">Email</label>
        <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="email@example.com"
          className="w-full px-4 py-2.5 rounded-xl border border-border bg-input-background outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1.5">Mật khẩu</label>
        <div className="relative">
          <input type={showPw ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
            className="w-full px-4 py-2.5 pr-10 rounded-xl border border-border bg-input-background outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm" />
          <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1.5">Xác nhận mật khẩu</label>
        <input type="password" required value={confirmPw} onChange={e => setConfirmPw(e.target.value)} placeholder="••••••••"
          className="w-full px-4 py-2.5 rounded-xl border border-border bg-input-background outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm" />
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-primary to-blue-800 flex-col items-center justify-center p-12 text-white">
        <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mb-6">
          <BookOpen className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-4 text-center">EduMaster</h1>
        <p className="text-blue-100 text-center leading-relaxed">
          Tham gia cùng hơn 50.000 học viên đang học tập mỗi ngày.
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 bg-background overflow-y-auto">
        <div className="w-full max-w-md py-6">
          <div className="flex items-center gap-2 mb-6 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-primary">EduMaster</span>
          </div>

          <h2 className="mb-2">Đăng ký tài khoản</h2>

          <div className="flex rounded-xl overflow-hidden border border-border mb-6 mt-4">
            {(['student', 'teacher'] as Tab[]).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                  tab === t ? 'bg-primary text-white' : 'bg-white text-muted-foreground hover:bg-secondary'
                }`}
              >
                {t === 'student' ? 'Học sinh' : 'Giảng viên'}
              </button>
            ))}
          </div>

          {tab === 'student' ? (
            <form onSubmit={handleSubmitStudent} className="space-y-4">
              {commonFields}
              <button type="submit" disabled={loading} className="w-full py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 disabled:opacity-60 flex items-center justify-center gap-2">
                {loading && <Loader2 className="w-4 h-4 animate-spin" />} Đăng ký
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmitTeacher} className="space-y-4">
              {commonFields}
              <div>
                <label className="block text-sm font-medium mb-1.5">Số điện thoại</label>
                <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="0912345678"
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-input-background outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Chuyên môn</label>
                <input required value={expertise} onChange={e => setExpertise(e.target.value)} placeholder="Toán học, Vật lý..."
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-input-background outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Kinh nghiệm</label>
                <input value={experience} onChange={e => setExperience(e.target.value)} placeholder="5 năm kinh nghiệm giảng dạy..."
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-input-background outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Giới thiệu bản thân</label>
                <textarea rows={3} value={bio} onChange={e => setBio(e.target.value)} placeholder="Mô tả về bản thân và phương pháp giảng dạy..."
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-input-background outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Upload CV <span className="text-destructive">*</span></label>
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-4 cursor-pointer hover:border-primary hover:bg-secondary transition-colors">
                  <Upload className="w-6 h-6 text-muted-foreground mb-2" />
                  {cvFile ? (
                    <span className="text-sm text-primary font-medium">{cvFile.name}</span>
                  ) : (
                    <span className="text-sm text-muted-foreground">Chọn file PDF, DOCX</span>
                  )}
                  <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={e => setCvFile(e.target.files?.[0] || null)} />
                </label>
              </div>
              <button type="submit" disabled={loading} className="w-full py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 disabled:opacity-60 flex items-center justify-center gap-2">
                {loading && <Loader2 className="w-4 h-4 animate-spin" />} Đăng ký
              </button>
            </form>
          )}

          <p className="text-center text-sm text-muted-foreground mt-6">
            Đã có tài khoản?{' '}
            <Link to="/login" className="text-primary font-medium hover:underline">Đăng nhập</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
