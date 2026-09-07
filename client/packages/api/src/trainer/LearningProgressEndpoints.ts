// ============================================================
// LEARNING PROGRESS ENDPOINTS
// ============================================================

export const LearningProgressEndpoints = {
  // GET /api/learning-progress/material/{materialId}
  getMaterialProgress: (
    materialId: string,
  ) =>
    `/api/learning-progress/material/${materialId}`,

  // POST /api/learning-progress/sections/{sectionId}/complete
  completeSection: (
    sectionId: string,
  ) =>
    `/api/learning-progress/sections/${sectionId}/complete`,
};