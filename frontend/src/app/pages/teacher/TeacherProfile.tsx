import { useState } from 'react';
import { TeacherLayout } from './TeacherLayout';
import { teacherApi } from '../../services/teacherApi';
import { Upload, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';

export function TeacherProfile() {
  const { user } = useAuth();
  const [expertise, setExpertise] = useState('');
  const [experience, setExperience] = useState('');
  const [bio, setBio] = useState('');
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await teacherApi.createProfile({ expertise, experience, bio });
      if (cvFile) await teacherApi.uploadCV(cvFile);
      toast.success('Cập nhật hồ sơ thành công!');
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Cập nhật thất bại');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full px-4 py-2.5 rounded-xl border border-border bg-input-background outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm";

  return (
    <TeacherLayout>
      <div className="mb-6">
        <h2>Hồ sơ giảng viên</h2>
        <p className="text-sm text-muted-foreground mt-1">Cập nhật thông tin hồ sơ chuyên môn</p>
      </div>

      <div className="max-w-xl">
        <div className="bg-card rounded-xl border border-border p-5 mb-5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-white text-xl font-bold">
            {user?.full_name?.charAt(0)}
          </div>
          <div>
            <p className="font-semibold">{user?.full_name}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="bg-card rounded-xl border border-border p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Chuyên môn</label>
            <input value={expertise} onChange={e => setExpertise(e.target.value)} placeholder="Toán học, Vật lý..." className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Kinh nghiệm</label>
            <input value={experience} onChange={e => setExperience(e.target.value)} placeholder="5 năm giảng dạy..." className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Giới thiệu bản thân</label>
            <textarea rows={4} value={bio} onChange={e => setBio(e.target.value)} className={`${inputCls} resize-none`} placeholder="Mô tả chuyên môn và phương pháp giảng dạy..." />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Upload CV</label>
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-4 cursor-pointer hover:border-primary hover:bg-secondary/50 transition-colors">
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
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Lưu hồ sơ
          </button>
        </form>
      </div>
    </TeacherLayout>
  );
}
