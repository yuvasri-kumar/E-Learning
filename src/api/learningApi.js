import client from "./client";

const enc = encodeURIComponent;

export const getEnrollments = async (signal) =>
  (await client.get("/enrollments", { signal })).data;

export const createEnrollment = async (payload) =>
  (await client.post("/enrollments", payload)).data;

export const getProgress = async (signal) =>
  (await client.get("/progress", { signal })).data;

export const patchProgress = async (courseId, lessonId) =>
  (await client.patch(`/progress/${enc(courseId)}`, { lessonId })).data;

export const putProgress = async (courseId, completedLessons) =>
  (await client.put(`/progress/${enc(courseId)}`, { completedLessons })).data;

export const postQuizSubmission = async (courseId, answers) =>
  (await client.post(`/quiz/${enc(courseId)}/submit`, { answers })).data;

export const getQuizResults = async (signal) =>
  (await client.get("/quiz-results", { signal })).data;

export const getAssignments = async (signal) =>
  (await client.get("/assignments", { signal })).data;

export const postAssignment = async (payload) =>
  (await client.post("/assignments", payload)).data;

export const postCertificate = async (courseId, studentName) =>
  (await client.post("/certificates", { courseId, studentName })).data;

export const getHistory = async (signal, params = {}) =>
  (await client.get("/history", { params, signal })).data;
