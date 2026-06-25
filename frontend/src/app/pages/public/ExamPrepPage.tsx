import { useEffect, useState } from 'react';
import { PublicLayout } from '../../components/layout/PublicLayout';
import { CourseCard } from '../../components/ui/CourseCard';
import { LoadingState, EmptyState, ErrorState } from '../../components/ui/States';
import { courseApi, courseTypeApi, commonApi } from '../../services/courseApi';
import { Course, CourseType, Subject, Grade } from '../../services/api';
import { BookCheck } from 'lucide-react';

export function ExamPrepPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseTypes, setCourseTypes] = useState<CourseType[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');

  const selectedCourseType = courseTypes.find(t => String(t.id) === selectedType);
  const requiresGrade = selectedCourseType?.requires_grade ?? true;

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

  const load = () => {
    setLoading(true);
    setError('');
    const params: Record<string, string> = {};
    if (selectedType) params.course_type_id = selectedType;
    if (selectedSubject) params.subject_id = selectedSubject;
    if (selectedGrade && requiresGrade) params.grade_id = selectedGrade;
    courseApi.examPrepList(params)
      .then(data => { setCourses(data as Course[]); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  };

  useEffect(() => {
    if (selectedType) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedType, selectedSubject, selectedGrade]);

  const selectCls = "w-full px-3 py-2.5 rounded-xl border border-border bg-white text-sm outline-none focus:border-primary";

  return (
    <PublicLayout>
      <div className="bg-gradient-to-r from-primary to-blue-800 text-white py-10 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <BookCheck className="w-12 h-12 mx-auto mb-3 text-accent" />
          <h1 className="text-white mb-2">Luyện thi đại học</h1>
          <p className="text-blue-100">Chọn chương trình, môn học và lớp để tìm khóa học phù hợp</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-white rounded-2xl border border-border shadow-sm p-6 mb-8">
          <h3 className="mb-4 text-center">Chọn khóa học phù hợp</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Chương trình <span className="text-destructive">*</span></label>
              <select value={selectedType} onChange={e => { setSelectedType(e.target.value); setSelectedGrade(''); }} className={selectCls}>
                <option value="">-- Chọn chương trình --</option>
                {courseTypes.map(t => <option key={t.id} value={String(t.id)}>{t.name}</option>)}
              </select>
            </div>
            {requiresGrade && (
              <div>
                <label className="block text-sm font-medium mb-1.5">Lớp</label>
                <select value={selectedGrade} onChange={e => setSelectedGrade(e.target.value)} className={selectCls}>
                  <option value="">-- Chọn lớp --</option>
                  {grades.map(g => <option key={g.id} value={String(g.id)}>{g.name}</option>)}
                </select>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-1.5">Môn học</label>
              <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} className={selectCls}>
                <option value="">-- Chọn môn --</option>
                {subjects.map(s => <option key={s.id} value={String(s.id)}>{s.name}</option>)}
              </select>
            </div>
          </div>
        </div>

        {!selectedType ? (
          <EmptyState title="Chọn chương trình để xem khóa học" icon={BookCheck} />
        ) : loading ? <LoadingState /> : error ? (
          <ErrorState error={error} onRetry={load} />
        ) : courses.length === 0 ? (
          <EmptyState title="Không có khóa học phù hợp" description="Thử thay đổi bộ lọc" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {courses.map(c => <CourseCard key={c.id} course={c} />)}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
