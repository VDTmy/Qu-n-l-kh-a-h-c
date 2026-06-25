import { api, Course, CourseType, Subject, Grade } from './api';

export const courseApi = {
  list: (params?: Record<string, string>) =>
    api.get<Course[]>('/courses/', params as Record<string, unknown>),

  get: (id: number) => api.get<Course>(`/courses/${id}`),

  examPrepList: (params?: Record<string, string>) =>
    api.get<Course[]>('/courses/exam-prep/list', params as Record<string, unknown>),

  create: (data: Partial<Course>) => api.post<Course>('/courses/', data),

  uploadThumbnail: (courseId: number, file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    return api.postForm<Course>(`/courses/${courseId}/thumbnail`, fd);
  },
};

export const courseTypeApi = {
  list: () => api.get<CourseType[]>('/course-types/'),
  create: (data: { name: string; requires_grade: boolean }) =>
    api.post<CourseType>('/course-types/', data),
};

export const commonApi = {
  subjects: () => api.get<Subject[]>('/common/subjects'),
  createSubject: (data: { name: string }) => api.post<Subject>('/common/subjects', data),
  grades: () => api.get<Grade[]>('/common/grades'),
  createGrade: (data: { name: string }) => api.post<Grade>('/common/grades', data),
};
