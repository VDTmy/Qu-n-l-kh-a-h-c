import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { PublicLayout } from '../../components/layout/PublicLayout';
import { CourseCard } from '../../components/ui/CourseCard';
import { NewsCard } from '../../components/ui/NewsCard';
import { LoadingState } from '../../components/ui/States';
import { api, HomeData, assetUrl } from '../../services/api';
import { Award, BookOpen, GraduationCap, Search, TrendingUp, Users } from 'lucide-react';

export function HomePage() {
  const [data, setData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get<HomeData>('/home/')
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const stats = data?.statistics
    ? [
        { label: 'Học viên', value: data.statistics.students.toLocaleString('vi-VN') + '+', icon: Users, color: 'text-primary' },
        { label: 'Khóa học', value: data.statistics.courses.toLocaleString('vi-VN') + '+', icon: BookOpen, color: 'text-accent' },
        { label: 'Giảng viên', value: data.statistics.teachers.toLocaleString('vi-VN') + '+', icon: GraduationCap, color: 'text-green-600' },
        { label: 'Lượt đăng ký', value: data.statistics.enrollments.toLocaleString('vi-VN') + '+', icon: Award, color: 'text-purple-600' },
      ]
    : [
        { label: 'Học viên', value: '50.000+', icon: Users, color: 'text-primary' },
        { label: 'Khóa học', value: '500+', icon: BookOpen, color: 'text-accent' },
        { label: 'Giảng viên', value: '100+', icon: GraduationCap, color: 'text-green-600' },
        { label: 'Lượt đăng ký', value: '200.000+', icon: Award, color: 'text-purple-600' },
      ];

  const featuredCourses = data?.featured_courses?.filter(c => c.status === 'approved').slice(0, 8) ?? [];
  const latestNews = data?.latest_news?.filter(n => n.is_published).slice(0, 3) ?? [];

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary to-blue-800 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-20 left-10 w-40 h-40 rounded-full bg-white" />
          <div className="absolute bottom-10 right-20 w-60 h-60 rounded-full bg-accent" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-block bg-accent/20 text-accent border border-accent/30 text-sm font-medium px-3 py-1 rounded-full mb-4">
              Nền tảng học trực tuyến #1 Việt Nam
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-4">
              Học mọi lúc,<br /> mọi nơi cùng <span className="text-accent">EduMaster</span>
            </h1>
            <p className="text-blue-100 mb-8 leading-relaxed">
              Hàng trăm khóa học chất lượng cao từ THCS đến luyện thi đại học, được giảng dạy bởi đội ngũ giảng viên hàng đầu Việt Nam.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/courses" className="px-6 py-3 bg-accent text-white rounded-xl font-semibold hover:bg-accent/90 transition-colors text-center">
                Khám phá khóa học
              </Link>
              <Link to="/exam-prep" className="px-6 py-3 bg-white/10 text-white border border-white/20 rounded-xl font-semibold hover:bg-white/20 transition-colors text-center">
                Luyện thi ngay
              </Link>
            </div>
          </div>
          <div className="hidden md:flex items-center justify-center">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=500&h=380&fit=crop&auto=format"
                alt="Học sinh học trực tuyến"
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-4 -left-4 bg-white rounded-xl p-3 shadow-lg">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">Điểm trung bình</p>
                    <p className="font-bold text-foreground">9.2 / 10</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Search */}
      <section className="bg-white border-b border-border py-6">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex items-center gap-3 bg-muted rounded-xl px-4 py-3 shadow-sm">
            <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Tìm khóa học theo tên, môn học, giảng viên..."
              className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
              onKeyDown={e => { if (e.key === 'Enter' && search) window.location.href = `/courses?keyword=${encodeURIComponent(search)}`; }}
            />
            <Link
              to={`/courses${search ? `?keyword=${encodeURIComponent(search)}` : ''}`}
              className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Tìm
            </Link>
          </div>
          <div className="flex flex-wrap gap-2 mt-3 justify-center">
            {['Toán', 'Vật lý', 'Hóa học', 'Tiếng Anh', 'Ngữ văn', 'Sinh học'].map(s => (
              <Link key={s} to={`/courses?keyword=${encodeURIComponent(s)}`}
                className="text-xs px-3 py-1 rounded-full bg-secondary text-primary hover:bg-primary hover:text-white transition-colors">
                {s}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-10 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map(s => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="text-center">
                <Icon className={`w-8 h-8 mx-auto mb-2 ${s.color}`} />
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-12 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2>Khóa học nổi bật</h2>
            <p className="text-sm text-muted-foreground mt-1">Được nhiều học viên đăng ký nhất</p>
          </div>
          <Link to="/courses" className="text-sm text-primary font-medium hover:underline">Xem tất cả →</Link>
        </div>
        {loading ? (
          <LoadingState />
        ) : featuredCourses.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">Chưa có khóa học nào.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featuredCourses.map(c => <CourseCard key={c.id} course={c} />)}
          </div>
        )}
      </section>

      {/* Exam Prep CTA */}
      <section className="bg-gradient-to-r from-accent to-orange-500 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-white mb-3">Luyện thi đại học hiệu quả</h2>
          <p className="text-orange-100 mb-6">Hơn 200 đề thi thử, bám sát cấu trúc đề thi THPT Quốc Gia mới nhất.</p>
          <Link to="/exam-prep" className="inline-block px-8 py-3 bg-white text-accent font-semibold rounded-xl hover:bg-orange-50 transition-colors">
            Bắt đầu luyện thi ngay
          </Link>
        </div>
      </section>

      {/* Latest News */}
      {latestNews.length > 0 && (
        <section className="py-12 px-4 sm:px-6 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2>Tin tức mới nhất</h2>
              <p className="text-sm text-muted-foreground mt-1">Cập nhật kiến thức và xu hướng giáo dục</p>
            </div>
            <Link to="/news" className="text-sm text-primary font-medium hover:underline">Xem tất cả →</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {latestNews.map(n => <NewsCard key={n.id} article={n} />)}
          </div>
        </section>
      )}
    </PublicLayout>
  );
}
