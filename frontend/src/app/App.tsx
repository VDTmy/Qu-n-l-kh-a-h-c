/* MARKER-MAKE-KIT-INVOKED */
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { Toaster } from 'sonner';
import { AuthProvider } from './contexts/AuthContext';
import { StudentGuard, TeacherGuard, AdminGuard } from './components/guards/ProtectedRoute';

// Public pages
import { HomePage } from './pages/public/HomePage';
import { LoginPage } from './pages/public/LoginPage';
import { RegisterPage } from './pages/public/RegisterPage';
import { CoursesPage } from './pages/public/CoursesPage';
import { CourseDetailPage } from './pages/public/CourseDetailPage';
import { ExamPrepPage } from './pages/public/ExamPrepPage';
import { NewsListPage, NewsDetailPage } from './pages/public/NewsPage';
import { ContactPage } from './pages/public/ContactPage';
import { InstructorsPage } from './pages/public/InstructorsPage';

// Student pages
import { StudentDashboard } from './pages/student/StudentDashboard';
import { StudentCourses } from './pages/student/StudentCourses';
import { StudentScores } from './pages/student/StudentScores';
import { StudentProgress } from './pages/student/StudentProgress';
import { StudentLecturers } from './pages/student/StudentLecturers';
import { StudentCertificates } from './pages/student/StudentCertificates';
import { StudentNotifications } from './pages/student/StudentNotifications';
import { StudentProfile } from './pages/student/StudentProfile';
import { LearnPage } from './pages/student/LearnPage';
import { ExamPage, ExamResultPage } from './pages/student/ExamPage';

// Teacher status pages
import { TeacherPendingPage, TeacherRejectedPage, TeacherCompleteProfilePage } from './pages/teacher/TeacherStatusPages';

// Teacher pages
import { TeacherDashboard } from './pages/teacher/TeacherDashboard';
import { TeacherProfile } from './pages/teacher/TeacherProfile';
import { TeacherCourses } from './pages/teacher/TeacherCourses';
import { NewCoursePage } from './pages/teacher/NewCoursePage';
import { TeacherLessons } from './pages/teacher/TeacherLessons';
import { TeacherDocuments } from './pages/teacher/TeacherDocuments';
import { TeacherExams } from './pages/teacher/TeacherExams';
import { TeacherStudents } from './pages/teacher/TeacherStudents';
import { TeacherComments } from './pages/teacher/TeacherComments';

// Admin pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { TeacherApproval } from './pages/admin/TeacherApproval';
import { CourseApproval } from './pages/admin/CourseApproval';
import { AdminNews } from './pages/admin/AdminNews';
import { AdminContacts } from './pages/admin/AdminContacts';
import { AdminComments } from './pages/admin/AdminComments';
import { AdminSubjects } from './pages/admin/AdminSubjects';
import { AdminCourseTypes } from './pages/admin/AdminCourseTypes';
import { AdminProfile } from './pages/admin/AdminProfile';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" richColors />
        <Routes>
          {/* Public */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/courses/:id" element={<CourseDetailPage />} />
          <Route path="/exam-prep" element={<ExamPrepPage />} />
          <Route path="/instructors" element={<InstructorsPage />} />
          <Route path="/news" element={<NewsListPage />} />
          <Route path="/news/:id" element={<NewsDetailPage />} />
          <Route path="/contact" element={<ContactPage />} />

          {/* Student */}
          <Route path="/student/dashboard" element={<StudentGuard><StudentDashboard /></StudentGuard>} />
          <Route path="/student/courses" element={<StudentGuard><StudentCourses /></StudentGuard>} />
          <Route path="/student/scores" element={<StudentGuard><StudentScores /></StudentGuard>} />
          <Route path="/student/progress" element={<StudentGuard><StudentProgress /></StudentGuard>} />
          <Route path="/student/lecturers" element={<StudentGuard><StudentLecturers /></StudentGuard>} />
          <Route path="/student/certificates" element={<StudentGuard><StudentCertificates /></StudentGuard>} />
          <Route path="/student/notifications" element={<StudentGuard><StudentNotifications /></StudentGuard>} />
          <Route path="/student/profile" element={<StudentGuard><StudentProfile /></StudentGuard>} />
          <Route path="/learn/:courseId/:lessonId" element={<StudentGuard><LearnPage /></StudentGuard>} />
          <Route path="/exam/:id" element={<StudentGuard><ExamPage /></StudentGuard>} />
          <Route path="/exam/:id/result" element={<StudentGuard><ExamResultPage /></StudentGuard>} />

          {/* Teacher status routes (no guard — accessible after login while status ≠ approved) */}
          <Route path="/teacher-pending" element={<TeacherPendingPage />} />
          <Route path="/teacher-rejected" element={<TeacherRejectedPage />} />
          <Route path="/teacher-complete-profile" element={<TeacherCompleteProfilePage />} />

          {/* Teacher */}
          <Route path="/lecturer/dashboard" element={<TeacherGuard><TeacherDashboard /></TeacherGuard>} />
          <Route path="/lecturer/profile" element={<TeacherGuard><TeacherProfile /></TeacherGuard>} />
          <Route path="/lecturer/courses" element={<TeacherGuard><TeacherCourses /></TeacherGuard>} />
          <Route path="/lecturer/courses/new" element={<TeacherGuard><NewCoursePage /></TeacherGuard>} />
          <Route path="/lecturer/lessons" element={<TeacherGuard><TeacherLessons /></TeacherGuard>} />
          <Route path="/lecturer/documents" element={<TeacherGuard><TeacherDocuments /></TeacherGuard>} />
          <Route path="/lecturer/exams" element={<TeacherGuard><TeacherExams /></TeacherGuard>} />
          <Route path="/lecturer/students" element={<TeacherGuard><TeacherStudents /></TeacherGuard>} />
          <Route path="/lecturer/results" element={<TeacherGuard><TeacherDashboard /></TeacherGuard>} />
          <Route path="/lecturer/comments" element={<TeacherGuard><TeacherComments /></TeacherGuard>} />

          {/* Admin */}
          <Route path="/admin/dashboard" element={<AdminGuard><AdminDashboard /></AdminGuard>} />
          <Route path="/admin/teacher-approval" element={<AdminGuard><TeacherApproval /></AdminGuard>} />
          <Route path="/admin/course-approval" element={<AdminGuard><CourseApproval /></AdminGuard>} />
          <Route path="/admin/news" element={<AdminGuard><AdminNews /></AdminGuard>} />
          <Route path="/admin/contacts" element={<AdminGuard><AdminContacts /></AdminGuard>} />
          <Route path="/admin/comments" element={<AdminGuard><AdminComments /></AdminGuard>} />
          <Route path="/admin/subjects" element={<AdminGuard><AdminSubjects /></AdminGuard>} />
          <Route path="/admin/course-types" element={<AdminGuard><AdminCourseTypes /></AdminGuard>} />
          <Route path="/admin/profile" element={<AdminGuard><AdminProfile /></AdminGuard>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
