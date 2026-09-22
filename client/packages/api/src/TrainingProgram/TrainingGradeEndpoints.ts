export const TrainingGradeEndpoints = {

  getAll: () => "/api/training-grade/all",

  getByEnrollment: (enrollmentId: string) =>
    `/api/training-grade/enrollment/${enrollmentId}`,
};