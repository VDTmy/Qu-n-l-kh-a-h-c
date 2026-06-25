import { api, Enrollment, Certificate, Comment, Notification } from "./api";

export const enrollmentApi = {
  enroll: (courseId: number) => api.post(`/enrollments/courses/${courseId}`),

  // Correct endpoint: /enrollments/my-courses
  myCourses: () => api.get<Enrollment[]>("/enrollments/my-courses"),

  status: (courseId: number) =>
    api.get<{ enrolled: boolean }>(`/enrollments/courses/${courseId}/status`),
};

export const progressApi = {
  // MỤC ĐÍCH:
  // Backend yêu cầu body gồm is_completed và watched_seconds.
  // Nếu không gửi body sẽ bị lỗi 422 Field required.

  markLesson: (lessonId: number) =>
    api.patch(`/progress/lessons/${lessonId}`, {
      is_completed: true,
      watched_seconds: 0,
    }),

  courseProgress: (courseId: number) =>
    api.get<{
      course_id: number;
      student_id: number;
      progress_percent: number;
      status: string;
    }>(`/progress/courses/${courseId}`),
};

export const studentApi = {
  myCourses: () => api.get<Enrollment[]>("/students/me/courses"),
  myScores: () => api.get<unknown[]>("/students/me/scores"),
  myStatistics: () =>
    api.get<{
      total_courses: number;
      avg_progress: number;
      avg_score: number;
      certificates: number;
    }>("/students/me/statistics"),
};

export const certificateApi = {
  download: (id: number) =>
  api.get(`/certificates/${id}/download`, {
    responseType: "blob",
  }),
  mine: () => api.get<Certificate[]>("/certificates/me"),
  generate: (courseId: number) =>
    api.post<Certificate>(`/certificates/courses/${courseId}/generate`),
};

export const commentApi = {
  // Corrected: /comments/courses/{courseId}
  byCourse: (courseId: number) =>
    api.get<Comment[]>(`/comments/courses/${courseId}`),

  byLesson: (lessonId: number) =>
    api.get<Comment[]>(`/comments/lessons/${lessonId}`),

  create: (data: { content: string; course_id?: number; lesson_id?: number }) =>
    api.post<Comment>("/comments/", data),
};

export const notificationApi = {
  mine: () => api.get<Notification[]>("/notifications/me"),

  // Corrected: response field is unread_count
  unreadCount: () =>
    api.get<{ unread_count: number }>("/notifications/me/unread-count"),

  read: (id: number) => api.patch(`/notifications/${id}/read`),
};
