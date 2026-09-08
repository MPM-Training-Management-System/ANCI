export const WrittenAssessmentEndpoints = {
  // =========================================================
  // ADMIN - ASSESSMENT
  // =========================================================

  getByBatchId: (trainingBatchId: string) =>
    `/api/written-assessments/batch/${trainingBatchId}`,

  getById: (id: string) =>
    `/api/written-assessments/${id}`,

  create: () =>
    `/api/written-assessments`,

  update: (id: string) =>
    `/api/written-assessments/${id}`,

  delete: (id: string) =>
    `/api/written-assessments/${id}`,

  publish: (
    id: string,
    isPublished: boolean,
  ) =>
    `/api/written-assessments/${id}/publish?isPublished=${isPublished}`,


     generateFromDocument: (
    assessmentId: string,
    questionCount: number,
  ) =>
    `/api/written-assessments/${assessmentId}/generate-from-document?questionCount=${questionCount}`,

  // =========================================================
  // QUESTIONS
  // =========================================================

  getQuestions: (
    assessmentId: string,
  ) =>
    `/api/written-assessments/${assessmentId}/questions`,

  createQuestion: () =>
    `/api/written-assessments/questions`,

  updateQuestion: (
    questionId: string,
  ) =>
    `/api/written-assessments/questions/${questionId}`,

  deleteQuestion: (
    questionId: string,
  ) =>
    `/api/written-assessments/questions/${questionId}`,

  // =========================================================
  // CHOICES
  // =========================================================

  createChoice: () =>
    `/api/written-assessments/choices`,

  updateChoice: (
    choiceId: string,
  ) =>
    `/api/written-assessments/choices/${choiceId}`,

  deleteChoice: (
    choiceId: string,
  ) =>
    `/api/written-assessments/choices/${choiceId}`,

  // =========================================================
  // PARTICIPANT
  // =========================================================

  getParticipantAssessment: (
    assessmentId: string,
  ) =>
    `/api/written-assessments/${assessmentId}/participant`,

  startAttempt: () =>
    `/api/written-assessments/start`,

  getAttempt: (
    attemptId: string,
  ) =>
    `/api/written-assessments/attempts/${attemptId}`,

  submitAttempt: () =>
    `/api/written-assessments/submit`,

  getMyResults: (
    assessmentId: string,
  ) =>
    `/api/written-assessments/${assessmentId}/results`,


  getParticipantAssessmentsByBatch: (trainingBatchId: string) =>
    `/api/written-assessments/batch/${trainingBatchId}/participant`,
};