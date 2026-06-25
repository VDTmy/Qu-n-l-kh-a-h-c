import { api, TeacherProfile, Course, Enrollment } from './api';

export const teacherApi = {
  myProfile: () => api.get<TeacherProfile>('/teachers/me/profile'),

  createProfile: (data: {
    phone?: string;
    expertise?: string;
    experience?: string;
    bio?: string;
  }) => api.post<TeacherProfile>('/teachers/profile', data),

  uploadCV: (file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    return api.postForm<TeacherProfile>('/teachers/profile/upload-cv', fd);
  },

  myCourses: () => api.get<Course[]>('/teachers/me/courses'),

  myCourseStudents: (courseId: number) =>
    api.get<Enrollment[]>(`/teachers/me/courses/${courseId}/students`),

  myExams: () => api.get<unknown[]>('/teachers/me/exams'),

  myStatistics: () => api.get<Record<string, number>>('/teachers/me/statistics'),
};
