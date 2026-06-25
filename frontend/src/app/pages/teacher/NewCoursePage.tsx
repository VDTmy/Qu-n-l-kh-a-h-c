import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { TeacherLayout } from './TeacherLayout';
import { BackButton } from '../../components/ui/BackButton';
import { courseApi, courseTypeApi, commonApi } from '../../services/courseApi';
import { CourseType, Subject, Grade } from '../../services/api';
import { Loader2, Upload } from 'lucide-react';
import { toast } from 'sonner';

export function NewCoursePage() {
  const navigate = useNavigate();
  const [courseTypes, setCourseTypes] = useState<CourseType[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(false);
  const [thumbnail, setThumbnail] = useState<File | null>(null);

  const [form, setForm] = useState({
    title: '', short_description: '', full_description: '',
    price: 0, level: 'beginner', course_type_id: '', subject_id: '', grade_id: '',
  });

  const selectedType = courseTypes.find(t => String(t.id) === form.course_type_id);

  useEffect(() => {
    Promise.all([
      courseTypeApi.list().catch(() => []),
      commonApi.subjects().catch(() => []),
      commonApi.grades().catch(() => []),
    ]).then(([ct, sub, gr]) => {
      setCourseTypes(ct as CourseType[]);
      setSubjects(sub as Subject[]);
      setGrades(gr as Grade[]);
    });
  }, []);

  const set = (k: string, v: unknown) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload: Record<string, unknown> = {
        title: form.title,
        short_description: form.short_description,
        full_description: form.full_description,
        price: Number(form.price),
        level: form.level,
      };
      if (form.course_type_id) payload.course_type_id = Number(form.course_type_id);
      if (form.subject_id) payload.subject_id = Number(form.subject_id);
      if (form.grade_id && selectedType?.requires_grade) payload.grade_id = Number(form.grade_id);

      const course = await courseApi.create(payload as Parameters<typeof courseApi.create>[0]);
      if (thumbnail) await courseApi.uploadThumbnail(course.id, thumbnail);
      toast.success('Khóa học đã được gửi Admin duyệt!');
      navigate('/lecturer/courses');
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Tạo thất bại');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full px-4 py-2.5 rounded-xl border border-border bg-input-background outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm";
  const selectCls = `${inputCls}`;

  return (
    <TeacherLayout>
      <div className="mb-6">
        <BackButton to="/lecturer/courses" />
        <h2 className="mt-2">Tạo khóa học mới</h2>
        <p className="text-sm text-muted-foreground mt-1">Điền đầy đủ thông tin khóa học</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
        <div className="bg-card rounded-xl border border-border p-5 space-y-4">
          <h3 className="border-b border-border pb-3">Thông tin cơ bản</h3>
          <div>
            <label className="block text-sm font-medium mb-1.5">Tên khóa học <span className="text-destructive">*</span></label>
            <input required value={form.title} onChange={e => set('title', e.target.value)} className={inputCls} placeholder="Nhập tên khóa học..." />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Mô tả ngắn</label>
            <input value={form.short_description} onChange={e => set('short_description', e.target.value)} className={inputCls} placeholder="Mô tả ngắn gọn..." />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Mô tả đầy đủ</label>
            <textarea rows={4} value={form.full_description} onChange={e => set('full_description', e.target.value)} className={`${inputCls} resize-none`} placeholder="Mô tả chi tiết về nội dung khóa học..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Giá (VNĐ)</label>
              <input type="number" min="0" value={form.price} onChange={e => set('price', e.target.value)} className={inputCls} placeholder="0 = miễn phí" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Cấp độ</label>
              <select value={form.level} onChange={e => set('level', e.target.value)} className={selectCls}>
                <option value="beginner">Cơ bản</option>
                <option value="intermediate">Trung bình</option>
                <option value="advanced">Nâng cao</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-5 space-y-4">
          <h3 className="border-b border-border pb-3">Phân loại</h3>
          <div>
            <label className="block text-sm font-medium mb-1.5">Loại khóa học</label>
            <select value={form.course_type_id} onChange={e => { set('course_type_id', e.target.value); set('grade_id', ''); }} className={selectCls}>
              <option value="">-- Chọn loại --</option>
              {courseTypes.map(t => <option key={t.id} value={String(t.id)}>{t.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Môn học</label>
            <select value={form.subject_id} onChange={e => set('subject_id', e.target.value)} className={selectCls}>
              <option value="">-- Chọn môn --</option>
              {subjects.map(s => <option key={s.id} value={String(s.id)}>{s.name}</option>)}
            </select>
          </div>
          {selectedType?.requires_grade && (
            <div>
              <label className="block text-sm font-medium mb-1.5">Lớp</label>
              <select value={form.grade_id} onChange={e => set('grade_id', e.target.value)} className={selectCls}>
                <option value="">-- Chọn lớp --</option>
                {grades.map(g => <option key={g.id} value={String(g.id)}>{g.name}</option>)}
              </select>
            </div>
          )}
        </div>

        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="border-b border-border pb-3 mb-4">Hình ảnh đại diện</h3>
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-6 cursor-pointer hover:border-primary hover:bg-secondary/50 transition-colors">
            <Upload className="w-8 h-8 text-muted-foreground mb-2" />
            {thumbnail ? (
              <span className="text-sm text-primary font-medium">{thumbnail.name}</span>
            ) : (
              <span className="text-sm text-muted-foreground">Chọn ảnh thumbnail (JPG, PNG)</span>
            )}
            <input type="file" accept="image/*" className="hidden" onChange={e => setThumbnail(e.target.files?.[0] || null)} />
          </label>
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => navigate('/lecturer/courses')} className="px-5 py-2.5 border border-border rounded-xl text-sm hover:bg-muted">
            Hủy
          </button>
          <button type="submit" disabled={loading} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 disabled:opacity-60">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Tạo khóa học
          </button>
        </div>
      </form>
    </TeacherLayout>
  );
}
