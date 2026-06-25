// MỤC ĐÍCH:
// Axios instance dùng chung cho toàn bộ frontend.
// Tự động gắn JWT vào header.
// Chuẩn hóa type/interface khớp backend FastAPI EduMaster.

import axios from "axios";

export const BASE_URL = "http://127.0.0.1:8000";

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,

  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("role");

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    const detail = error.response?.data?.detail;

    if (detail) {
      return Promise.reject(
        new Error(typeof detail === "string" ? detail : JSON.stringify(detail)),
      );
    }

    return Promise.reject(error);
  },
);

export function assetUrl(path?: string | null): string | undefined {
  if (!path) return undefined;

  if (path.startsWith("http")) {
    return path;
  }

  return `${BASE_URL}${path}`;
}

export const api = {
  get: <T>(url: string, params?: Record<string, unknown>) =>
    axiosInstance.get<T>(url, { params }).then((r) => r.data),

  post: <T>(url: string, data?: unknown) =>
    axiosInstance.post<T>(url, data).then((r) => r.data),

  postForm: <T>(url: string, formData: FormData) =>
    axiosInstance.post<T>(url, formData).then((r) => r.data),

  patch: <T>(url: string, data?: unknown, params?: Record<string, unknown>) =>
    axiosInstance.patch<T>(url, data, { params }).then((r) => r.data),

  delete: <T>(url: string) => axiosInstance.delete<T>(url).then((r) => r.data),
};

export type UserRole = "student" | "teacher" | "admin";

export interface User {
  id: number;
  full_name: string;
  email: string;
  role: UserRole;
}

export interface Course {
  id: number;
  title: string;
  short_description?: string | null;
  full_description?: string | null;
  price: number;
  thumbnail_url?: string | null;
  level?: string | null;
  status: "pending" | "approved" | "rejected";
  teacher_id: number;
  subject_id: number;
  grade_id?: number | null;
  course_type_id: number;
  rejection_reason?: string | null;

  teacher?: User;
  subject?: Subject;
  grade?: Grade | null;
  course_type?: CourseType;
}

export interface CourseType {
  id: number;
  name: string;
  requires_grade: boolean;
}

export interface Subject {
  id: number;
  name: string;
  description?: string | null;
}

export interface Grade {
  id: number;
  name: string;
}

export interface TeacherProfile {
  id: number;
  user_id: number;
  phone?: string | null;
  expertise?: string | null;
  experience?: string | null;
  bio?: string | null;
  cv_file_url?: string | null;
  status: "pending" | "approved" | "rejected";
  rejection_reason?: string | null;

  user?: User;
  teacher?: User;
}

export interface Section {
  id: number;
  course_id: number;
  title: string;
  order_index: number;
}

export interface Lesson {
  id: number;
  section_id: number;
  title: string;
  content?: string | null;
  video_url?: string | null;
  document_url?: string | null;
  duration_minutes: number;
  order_index: number;
  is_free: boolean;

  section?: Section;
}

export interface Enrollment {
  id: number;
  student_id: number;
  course_id: number;
  status: "active" | "completed" | "cancelled";
  progress_percent: number;

  course?: Course;
  student?: User;
}

export interface LessonProgress {
  id: number;
  student_id: number;
  lesson_id: number;
  is_completed: boolean;
  watched_seconds: number;
}

export interface Exam {
  id: number;
  course_id: number;
  teacher_id: number;
  title: string;
  description?: string | null;
  duration_minutes: number;
  total_score: number;
  status: "active" | "inactive";

  questions?: Question[];
}

export interface Question {
  id: number;
  exam_id: number;
  content: string;
  question_type: "single_choice" | "multiple_choice";
  score: number;

  answers?: Answer[];
}

export interface Answer {
  id: number;
  question_id: number;
  content: string;
  is_correct?: boolean;
}

export interface ExamAttempt {
  id: number;
  exam_id: number;
  student_id: number;
  score: number;

  exam?: Exam;
}

export interface NewsArticle {
  id: number;
  title: string;
  summary?: string | null;
  content: string;
  thumbnail_url?: string | null;
  category?: string | null;
  is_published: boolean;
  author_id: number;
}

export interface Contact {
  id: number;
  full_name: string;
  email: string;
  phone?: string | null;
  message: string;
  status: "new" | "processed";
}

export interface Comment {
  id: number;
  course_id: number;
  lesson_id?: number | null;
  user_id: number;
  parent_id?: number | null;
  content: string;
  is_pinned: boolean;
  is_deleted: boolean;

  user?: User;
}

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type?: string | null;
  is_read: boolean;
}

export interface Certificate {
  id: number;
  course_id: number;
  student_id: number;
  certificate_code: string;

  course?: Course;
  student?: User;
}

export interface HomeData {
  featured_courses: Course[];
  featured_teachers: TeacherProfile[];
  latest_news: NewsArticle[];
  statistics: {
    students: number;
    teachers: number;
    courses: number;
    enrollments: number;
  };
}

export interface AdminStatistics {
  users: {
    students: number;
    teachers: number;
    admins: number;
  };
  teachers: {
    pending: number;
    approved: number;
  };
  courses: {
    total: number;
    approved: number;
    pending: number;
    rejected: number;
  };
  learning: {
    enrollments: number;
    exams: number;
  };
  contacts: {
    new: number;
  };
}

export interface TeacherStatistics {
  courses: {
    total: number;
    approved: number;
    pending: number;
  };
  students: {
    total_enrollments: number;
  };
  exams: {
    total: number;
  };
}

export interface StudentStatistics {
  courses: {
    total: number;
    active: number;
    completed: number;
  };
  lessons: {
    completed: number;
  };
  exams: {
    attempts: number;
    average_score: number;
  };
}
