import {
  api,
  TeacherProfile,
  Course,
  Comment,
  Contact,
  NewsArticle,
} from "./api";

export const adminApi = {
  pendingTeachers: () => api.get<TeacherProfile[]>("/admin/teachers/pending"),

  approveTeacher: (profileId: number) =>
    api.patch(`/admin/teachers/${profileId}/approve`),

  rejectTeacher: (profileId: number, reason: string) =>
    api.patch(`/admin/teachers/${profileId}/reject`, undefined, { reason }),

  pendingCourses: () => api.get<Course[]>("/admin/courses/pending"),

  approveCourse: (courseId: number) =>
    api.patch(`/admin/courses/${courseId}/approve`),

  rejectCourse: (courseId: number, reason: string) =>
    api.patch(`/admin/courses/${courseId}/reject`, undefined, { reason }),

  comments: () => api.get<Comment[]>("/admin/comments"),

  deleteComment: (commentId: number) =>
    api.patch(`/admin/comments/${commentId}/delete`),

  pinComment: (commentId: number) =>
    api.patch(`/admin/comments/${commentId}/pin`),

  unpinComment: (commentId: number) =>
    api.patch(`/admin/comments/${commentId}/unpin`),

  dashboard: () =>
    api.get<Record<string, number>>("/admin/dashboard/statistics"),
};

export const newsApi = {
  list: () => api.get<NewsArticle[]>("/news/"),
  get: (id: number) => api.get<NewsArticle>(`/news/${id}`),
  create: (data: Partial<NewsArticle>) => api.post<NewsArticle>("/news/", data),
  update: (id: number, data: Partial<NewsArticle>) =>
    api.patch<NewsArticle>(`/news/${id}`, data),
  hide: (id: number) => api.patch(`/news/${id}/hide`),
};

export const contactApi = {
  list: () => api.get<Contact[]>("/contacts/"),
  create: (data: {
    full_name: string;
    email: string;
    phone?: string;
    message: string;
  }) => api.post<Contact>("/contacts/", data),
  process: (id: number) => api.patch(`/contacts/${id}/process`),
};

export const progressApi = {
  markLesson: (lessonId: number) => api.patch(`/progress/lessons/${lessonId}`),

  courseProgress: (courseId: number) =>
    api.get(`/progress/courses/${courseId}`),
};
