// MỤC ĐÍCH:
// API quản lý chương học và bài giảng.

import { api, Lesson, Section } from "./api";

export const lessonApi = {
  byCourse: (courseId: number) => api.get(`/lessons/course/${courseId}`),

  sectionsByCourse: (courseId: number) =>
    api.get(`/lessons/sections/course/${courseId}`),

  createSection: (data: any) => api.post("/lessons/sections", data),

  createLesson: (data: any) => api.post("/lessons/", data),

  uploadVideo: (lessonId: number, file: File) => {
    const form = new FormData();
    form.append("file", file);

    return api.post(`/lessons/upload-video/${lessonId}`, form);
  },

  uploadDocument: (lessonId: number, file: File) => {
    const form = new FormData();
    form.append("file", file);

    return api.post(`/lessons/upload-document/${lessonId}`, form);
  },
};
