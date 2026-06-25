import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import { PublicLayout } from '../../components/layout/PublicLayout';
import { CourseCard } from '../../components/ui/CourseCard';
import { LoadingState, EmptyState, ErrorState } from '../../components/ui/States';
import { courseApi, courseTypeApi, commonApi } from '../../services/courseApi';
import { Course, CourseType, Subject, Grade } from '../../services/api';
import { Filter, SlidersHorizontal } from 'lucide-react';

export function CoursesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseTypes, setCourseTypes] = useState<CourseType[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || searchParams.get('q') || '');

  const selectedCourseType = courseTypes.find(t => String(t.id) === selectedType);
  const requiresGrade = selectedCourseType?.requires_grade ?? true;

  const load = () => {
    setLoading(true);
    setError('');
    const params: Record<string, string> = {};
    if (selectedType) params.course_type_id = selectedType;
    if (selectedSubject) params.subject_id = selectedSubject;
    if (selectedGrade && requiresGrade) params.grade_id = selectedGrade;
    if (keyword) params.keyword = keyword;

    courseApi.list(params)
      .then(data => {
        setCourses((data as Course[]).filter(c => c.status === 'approved'));
        setLoading(false);
      })
      .catch(e => { setError(e.message); setLoading(false); });
  };

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

  useEffect(() => { load(); }, [selectedType, selectedSubject, selectedGrade, keyword]);

  const selectCls = "px-3 py-2 rounded-xl border border-border bg-white text-sm outline-none focus:border-primary";

  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <h1>Danh sách khóa học</h1>
          <p className="text-sm text-muted-foreground mt-1">Tất cả khóa học chất lượng cao từ đội ngũ giảng viên chuyên nghiệp</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-border p-4 mb-6 flex flex-wrap gap-3 items-end">
          <SlidersHorizontal className="w-5 h-5 text-muted-foreground self-center" />
          <div className="flex-1 min-w-40">
            <label className="block text-xs text-muted-foreground mb-1">Từ khóa</label>
            <input
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              placeholder="Tìm kiếm..."
              className="w-full px-3 py-2 rounded-xl border border-border bg-input-background text-sm outline-none focus:border-primary"
            />
          </div>
          <div className="min-w-36">
            <label className="block text-xs text-muted-foreground mb-1">Loại khóa học</label>
            <select value={selectedType} onChange={e => setSelectedType(e.target.value)} className={selectCls}>
              <option value="">Tất cả</option>
              {courseTypes.map(t => <option key={t.id} value={String(t.id)}>{t.name}</option>)}
            </select>
          </div>
          <div className="min-w-36">
            <label className="block text-xs text-muted-foreground mb-1">Môn học</label>
            <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} className={selectCls}>
              <option value="">Tất cả</option>
              {subjects.map(s => <option key={s.id} value={String(s.id)}>{s.name}</option>)}
            </select>
          </div>
          {requiresGrade && (
            <div className="min-w-32">
              <label className="block text-xs text-muted-foreground mb-1">Lớp</label>
              <select value={selectedGrade} onChange={e => setSelectedGrade(e.target.value)} className={selectCls}>
                <option value="">Tất cả</option>
                {grades.map(g => <option key={g.id} value={String(g.id)}>{g.name}</option>)}
              </select>
            </div>
          )}
          <button onClick={load} className="px-4 py-2 bg-primary text-white rounded-xl text-sm hover:bg-primary/90 flex items-center gap-1.5">
            <Filter className="w-4 h-4" /> Lọc
          </button>
        </div>

        {loading ? <LoadingState /> : error ? (
          <ErrorState error={error} onRetry={load} />
        ) : courses.length === 0 ? (
          <EmptyState title="Không tìm thấy khóa học" description="Thử thay đổi bộ lọc tìm kiếm" />
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-4">Hiển thị {courses.length} khóa học</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {courses.map(c => <CourseCard key={c.id} course={c} />)}
            </div>
          </>
        )}
      </div>
    </PublicLayout>
  );
}
