export const LearningMaterialEndpoints = {

  // ==========================================
  // LEARNING MATERIAL
  // ==========================================

  listByBatch: (
    trainingBatchId: string,
  ) =>
    `/api/learning-materials/batch/${trainingBatchId}`,

  byId: (
    id: string,
  ) =>
    `/api/learning-materials/${id}`,

  create:
    "/api/learning-materials",

  update: (
    id: string,
  ) =>
    `/api/learning-materials/${id}`,

  delete: (
    id: string,
  ) =>
    `/api/learning-materials/${id}`,

  publish: (
    id: string,
  ) =>
    `/api/learning-materials/${id}/publish`,

  // ==========================================
  // FILE
  // ==========================================

  uploadFile: (
    id: string,
  ) =>
    `/api/learning-materials/${id}/upload`,

  extractText: (
    id: string,
  ) =>
    `/api/learning-materials/${id}/extract`,

  // ==========================================
  // MODULES
  // ==========================================

  modules: (
    learningMaterialId: string,
  ) =>
    `/api/learning-materials/${learningMaterialId}/modules`,

  createModule:
    "/api/learning-materials/modules",

  updateModule: (
    moduleId: string,
  ) =>
    `/api/learning-materials/modules/${moduleId}`,

  deleteModule: (
    moduleId: string,
  ) =>
    `/api/learning-materials/modules/${moduleId}`,

      // ==========================================
  // MODULE FILE
  // ==========================================

  uploadModuleFile: (
    moduleId: string,
  ) =>
    `/api/learning-materials/modules/${moduleId}/upload`,

  extractModuleText: (
    moduleId: string,
  ) =>
    `/api/learning-materials/modules/${moduleId}/extract`,

  // ==========================================
  // AI MODULE CONTENT
  // ==========================================

  generateModuleAiContent: (
    moduleId: string,
  ) =>
    `/api/learning-materials/modules/${moduleId}/generate-ai`,

  // ==========================================
  // SECTIONS
  // ==========================================

  sections: (
    moduleId: string,
  ) =>
    `/api/learning-materials/modules/${moduleId}/sections`,

  createSection:
    "/api/learning-materials/sections",

  updateSection: (
    sectionId: string,
  ) =>
    `/api/learning-materials/sections/${sectionId}`,

  deleteSection: (
    sectionId: string,
  ) =>
    `/api/learning-materials/sections/${sectionId}`,
};