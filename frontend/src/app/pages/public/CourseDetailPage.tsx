import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { PublicLayout } from '../../components/layout/PublicLayout';
import { LoadingState, ErrorState } from '../../components/ui/States';
import { BackButton } from '../../components/ui/BackButton';
import { courseApi } from '../../services/courseApi';
import { enrollmentApi } from '../../services/studentApi';
import { useAuth } from '../../contexts/AuthContext';
import { Course, assetUrl } from '../../services/api';
import { BookOpen, Clock, GraduationCap, Loader2, Star, Users } from 'lucide-react';
import { toast } from 'sonner';

export function CourseDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [enrolled, setEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    courseApi.get(Number(id))
      .then(c => {
        setCourse(c);
        if (user?.role === 'student') {
          return enrollmentApi.status(Number(id)).then(s => setEnrolled(s.enrolled)).catch(() => {});
        }
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id, user]);

  const handleEnroll = async () => {
    if (!user) { navigate('/login'); return; }
    setEnrollLoading(true);
    try {
      await enrollmentApi.enroll(Number(id));
      setEnrolled(true);
      toast.success('Đăng ký khóa học thành công!');
    } catch (e: unknown) {
      toast.error((e as Error).message || 'Đăng ký thất bại');
    } finally {
      setEnrollLoading(false);
    }
  };

  const levelLabel: Record<string, string> = { beginner: 'Cơ bản', intermediate: 'Trung bình', advanced: 'Nâng cao' };

  if (loading) return <PublicLayout><LoadingState /></PublicLayout>;
  if (error) return <PublicLayout><div className="max-w-4xl mx-auto px-4 py-8"><ErrorState error={error} /></div></PublicLayout>;
  if (!course) return null;

  return (
    <PublicLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-4">
          <BackButton to="/courses" label="Quay lại danh sách" />
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <div className="flex flex-wrap gap-2 mb-3">
              {course.subject && <span className="text-xs bg-secondary text-primary px-2 py-0.5 rounded-full">{course.subject.name}</span>}
              {course.grade && <span className="text-xs bg-secondary text-primary px-2 py-0.5 rounded-full">{course.grade.name}</span>}
              <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{levelLabel[course.level] || course.level}</span>
            </div>
            <h1 className="mb-3">{course.title}</h1>
            <p className="text-muted-foreground mb-4">{course.short_description}</p>

            {course.teacher && (
              <div className="flex items-center gap-3 mb-6 p-3 bg-muted rounded-xl">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold">
                  {course.teacher.full_name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium">{course.teacher.full_name}</p>
                  <p className="text-xs text-muted-foreground">Giảng viên</p>
                </div>
              </div>
            )}

            <div className="bg-card rounded-xl border border-border p-5">
              <h3 className="mb-3">Mô tả khóa học</h3>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{course.full_description}</p>
            </div>
          </div>

          {/* Sidebar */}
          <div>
            <div className="sticky top-24 bg-card rounded-xl border border-border shadow-md overflow-hidden">
              <div className="aspect-video bg-secondary">
                {course.thumbnail_url ? (
                  <img src={assetUrl(course.thumbnail_url)} alt={course.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen className="w-12 h-12 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="p-5">
                <p className="text-2xl font-bold text-accent mb-4">
                  {course.price === 0 ? 'Miễn phí' : course.price.toLocaleString('vi-VN') + 'đ'}
                </p>
                <div className="space-y-2 mb-5">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <GraduationCap className="w-4 h-4" />
                    <span>Cấp độ: {levelLabel[course.level]}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>Đánh giá: 4.8 / 5.0</span>
                  </div>
                </div>

                {!user && (
                  <button onClick={() => navigate('/login')} className="w-full py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors">
                    Đăng nhập để đăng ký
                  </button>
                )}
                {user?.role === 'student' && !enrolled && (
                  <button onClick={handleEnroll} disabled={enrollLoading} className="w-full py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 disabled:opacity-60 flex items-center justify-center gap-2">
                    {enrollLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                    Đăng ký khóa học
                  </button>
                )}
                {user?.role === 'student' && enrolled && (
                  <button onClick={() => navigate(`/learn/${course.id}/1`)} className="w-full py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors">
                    Vào học ngay →
                  </button>
                )}
                {(user?.role === 'teacher' || user?.role === 'admin') && (
                  <div className="py-3 text-center text-sm text-muted-foreground bg-muted rounded-xl">
                    Chế độ xem thông tin
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
