"use client";

import {
  useCallback,
  useState,
} from "react";

import type {
  CreateLearningMaterialRequest,
  CreateLearningModuleRequest,
  CreateLearningSectionRequest,
  ExtractAllLearningModuleFilesResponse,
  LearningMaterial,
  LearningMaterialExtraction,
  LearningModule,
  LearningModuleFile,
  LearningModuleFileExtraction,
  LearningSection,
  UpdateLearningMaterialRequest,
  UpdateLearningModuleRequest,
  UpdateLearningSectionRequest,
} from "@repo/types";

// ==========================================
// ERROR HELPER
// ==========================================

function normalizeError(
  error: unknown,
  fallbackMessage: string,
): Error {
  if (error instanceof Error) {
    return error;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error
  ) {
    const message =
      (error as { message?: unknown }).message;

    if (
      typeof message === "string" &&
      message.trim()
    ) {
      return new Error(message);
    }
  }

  if (
    typeof error === "string" &&
    error.trim()
  ) {
    return new Error(error);
  }

  return new Error(fallbackMessage);
}

// ==========================================
// API CONTRACT
// ==========================================

export interface LearningMaterialApi {
  // ==========================================
  // LEARNING MATERIAL
  // ==========================================

  getByBatchId(
    trainingBatchId: string,
  ): Promise<LearningMaterial[]>;

  getById(
    id: string,
  ): Promise<LearningMaterial>;

  create(
    request: CreateLearningMaterialRequest,
  ): Promise<LearningMaterial>;

  update(
    id: string,
    request: UpdateLearningMaterialRequest,
  ): Promise<LearningMaterial>;

  delete(
    id: string,
  ): Promise<void>;

  publish(
    id: string,
  ): Promise<LearningMaterial>;

  uploadFile(
    id: string,
    file: File,
  ): Promise<LearningMaterial>;

  extractText(
    id: string,
  ): Promise<LearningMaterialExtraction>;

  // ==========================================
  // MODULES
  // ==========================================

  getModules(
    learningMaterialId: string,
  ): Promise<LearningModule[]>;

  createModule(
    request: CreateLearningModuleRequest,
  ): Promise<LearningModule>;

  updateModule(
    moduleId: string,
    request: UpdateLearningModuleRequest,
  ): Promise<LearningModule>;

  deleteModule(
    moduleId: string,
  ): Promise<void>;

  // ==========================================
  // MODULE FILES
  // ==========================================

  uploadModuleFile(
    moduleId: string,
    file: File,
  ): Promise<LearningModuleFile>;

  extractModuleFileText(
    moduleId: string,
    moduleFileId: string,
  ): Promise<LearningModuleFileExtraction>;

  extractAllModuleFiles(
    moduleId: string,
  ): Promise<ExtractAllLearningModuleFilesResponse>;

  // ==========================================
  // AI MODULE CONTENT
  // ==========================================

  generateModuleAiContent(
    moduleId: string,
  ): Promise<LearningModule>;

  // ==========================================
  // SECTIONS
  // ==========================================

  getSections(
    moduleId: string,
  ): Promise<LearningSection[]>;

  createSection(
    request: CreateLearningSectionRequest,
  ): Promise<LearningSection>;

  updateSection(
    sectionId: string,
    request: UpdateLearningSectionRequest,
  ): Promise<LearningSection>;

  deleteSection(
    sectionId: string,
  ): Promise<void>;
}

// ==========================================
// HOOK RESULT
// ==========================================

export interface UseLearningMaterialsResult {
  // ==========================================
  // LEARNING MATERIAL STATE
  // ==========================================

  learningMaterials: LearningMaterial[];

  selectedMaterial: LearningMaterial | null;

  extraction: LearningMaterialExtraction | null;

  // ==========================================
  // MODULE STATE
  // ==========================================

  modules: LearningModule[];

  moduleFileExtraction:
    | LearningModuleFileExtraction
    | null;

  // ==========================================
  // SECTION STATE
  // ==========================================

  sections: LearningSection[];

  // ==========================================
  // GENERAL STATE
  // ==========================================

  isLoading: boolean;

  isSaving: boolean;

  isUploading: boolean;

  isGenerating: boolean;

  isExtracting: boolean;

  // ==========================================
  // MODULE FILE STATE
  // ==========================================

  isUploadingModule: boolean;

  isExtractingModule: boolean;

  // ==========================================
  // ERROR
  // ==========================================

  error: string | null;

  // ==========================================
  // LEARNING MATERIAL ACTIONS
  // ==========================================

  loadLearningMaterials(
    trainingBatchId: string,
  ): Promise<LearningMaterial[]>;

  loadLearningMaterial(
    id: string,
  ): Promise<LearningMaterial>;

  createLearningMaterial(
    request: CreateLearningMaterialRequest,
  ): Promise<LearningMaterial>;

  updateLearningMaterial(
    id: string,
    request: UpdateLearningMaterialRequest,
  ): Promise<LearningMaterial>;

  deleteLearningMaterial(
    id: string,
  ): Promise<void>;

  publishLearningMaterial(
    id: string,
  ): Promise<LearningMaterial>;

  uploadLearningMaterial(
    id: string,
    file: File,
  ): Promise<LearningMaterial>;

  extractLearningMaterialText(
    id: string,
  ): Promise<LearningMaterialExtraction>;

  // ==========================================
  // MODULE ACTIONS
  // ==========================================

  loadModules(
    learningMaterialId: string,
  ): Promise<LearningModule[]>;

  createLearningModule(
    request: CreateLearningModuleRequest,
  ): Promise<LearningModule>;

  updateLearningModule(
    moduleId: string,
    request: UpdateLearningModuleRequest,
  ): Promise<LearningModule>;

  deleteLearningModule(
    moduleId: string,
  ): Promise<void>;

  // ==========================================
  // MODULE FILE ACTIONS
  // ==========================================

  uploadLearningModuleFile(
    moduleId: string,
    file: File,
  ): Promise<LearningModuleFile>;

  extractLearningModuleFileText(
    moduleId: string,
    moduleFileId: string,
  ): Promise<LearningModuleFileExtraction>;

  extractAllLearningModuleFiles(
    moduleId: string,
  ): Promise<ExtractAllLearningModuleFilesResponse>;

  // ==========================================
  // AI ACTIONS
  // ==========================================

  generateModuleAiContent(
    moduleId: string,
  ): Promise<LearningModule>;

  // ==========================================
  // SECTION ACTIONS
  // ==========================================

  loadSections(
    moduleId: string,
  ): Promise<LearningSection[]>;

  createLearningSection(
    request: CreateLearningSectionRequest,
  ): Promise<LearningSection>;

  updateLearningSection(
    sectionId: string,
    request: UpdateLearningSectionRequest,
  ): Promise<LearningSection>;

  deleteLearningSection(
    sectionId: string,
  ): Promise<void>;

  // ==========================================
  // UTILITY
  // ==========================================

  clearError(): void;

  clearExtraction(): void;

  clearModuleFileExtraction(): void;
}

// ==========================================
// HOOK
// ==========================================

export function useLearningMaterials(
  api: LearningMaterialApi,
): UseLearningMaterialsResult {
  // ==========================================
  // LEARNING MATERIAL STATE
  // ==========================================

  const [learningMaterials, setLearningMaterials] =
    useState<LearningMaterial[]>([]);

  const [selectedMaterial, setSelectedMaterial] =
    useState<LearningMaterial | null>(null);

  const [extraction, setExtraction] =
    useState<LearningMaterialExtraction | null>(
      null,
    );

  // ==========================================
  // MODULE STATE
  // ==========================================

  const [modules, setModules] =
    useState<LearningModule[]>([]);

  const [moduleFileExtraction, setModuleFileExtraction] =
    useState<LearningModuleFileExtraction | null>(
      null,
    );

  // ==========================================
  // SECTION STATE
  // ==========================================

  const [sections, setSections] =
    useState<LearningSection[]>([]);

  // ==========================================
  // GENERAL STATE
  // ==========================================

  const [isLoading, setIsLoading] =
    useState(false);

  const [isSaving, setIsSaving] =
    useState(false);

  const [isUploading, setIsUploading] =
    useState(false);

  const [isGenerating, setIsGenerating] =
    useState(false);

  const [isExtracting, setIsExtracting] =
    useState(false);

  // ==========================================
  // MODULE FILE STATE
  // ==========================================

  const [isUploadingModule, setIsUploadingModule] =
    useState(false);

  const [isExtractingModule, setIsExtractingModule] =
    useState(false);

  // ==========================================
  // ERROR
  // ==========================================

  const [error, setError] =
    useState<string | null>(null);

  // ==========================================
  // LOAD LEARNING MATERIALS
  // ==========================================

  const loadLearningMaterials =
    useCallback(
      async (trainingBatchId: string) => {
        try {
          setIsLoading(true);
          setError(null);

          const result =
            await api.getByBatchId(
              trainingBatchId,
            );

          setLearningMaterials(result);

          return result;
        } catch (err) {
          const normalizedError =
            normalizeError(
              err,
              "Failed to load learning materials.",
            );

          setError(
            normalizedError.message,
          );

          throw normalizedError;
        } finally {
          setIsLoading(false);
        }
      },
      [api],
    );

  // ==========================================
  // LOAD SINGLE LEARNING MATERIAL
  // ==========================================

  const loadLearningMaterial =
    useCallback(
      async (id: string) => {
        try {
          setIsLoading(true);
          setError(null);

          const result =
            await api.getById(id);

          setSelectedMaterial(result);

          setLearningMaterials(
            (previous) => {
              const exists =
                previous.some(
                  (material) =>
                    material.id === id,
                );

              if (!exists) {
                return [
                  ...previous,
                  result,
                ];
              }

              return previous.map(
                (material) =>
                  material.id === id
                    ? result
                    : material,
              );
            },
          );

          return result;
        } catch (err) {
          const normalizedError =
            normalizeError(
              err,
              "Failed to load learning material.",
            );

          setError(
            normalizedError.message,
          );

          throw normalizedError;
        } finally {
          setIsLoading(false);
        }
      },
      [api],
    );

  // ==========================================
  // CREATE LEARNING MATERIAL
  // ==========================================

  const createLearningMaterial =
    useCallback(
      async (
        request: CreateLearningMaterialRequest,
      ) => {
        try {
          setIsSaving(true);
          setError(null);

          const result =
            await api.create(request);

          setLearningMaterials(
            (previous) => [
              ...previous,
              result,
            ],
          );

          setSelectedMaterial(result);

          setExtraction(null);
          setModules([]);
          setSections([]);
          setModuleFileExtraction(null);

          return result;
        } catch (err) {
          const normalizedError =
            normalizeError(
              err,
              "Failed to create learning material.",
            );

          setError(
            normalizedError.message,
          );

          throw normalizedError;
        } finally {
          setIsSaving(false);
        }
      },
      [api],
    );

  // ==========================================
  // UPDATE LEARNING MATERIAL
  // ==========================================

  const updateLearningMaterial =
    useCallback(
      async (
        id: string,
        request: UpdateLearningMaterialRequest,
      ) => {
        try {
          setIsSaving(true);
          setError(null);

          const result =
            await api.update(
              id,
              request,
            );

          setLearningMaterials(
            (previous) =>
              previous.map(
                (material) =>
                  material.id === id
                    ? result
                    : material,
              ),
          );

          setSelectedMaterial(
            (previous) =>
              previous?.id === id
                ? result
                : previous,
          );

          return result;
        } catch (err) {
          const normalizedError =
            normalizeError(
              err,
              "Failed to update learning material.",
            );

          setError(
            normalizedError.message,
          );

          throw normalizedError;
        } finally {
          setIsSaving(false);
        }
      },
      [api],
    );

  // ==========================================
  // DELETE LEARNING MATERIAL
  // ==========================================

  const deleteLearningMaterial =
    useCallback(
      async (id: string) => {
        try {
          setIsSaving(true);
          setError(null);

          await api.delete(id);

          setLearningMaterials(
            (previous) =>
              previous.filter(
                (material) =>
                  material.id !== id,
              ),
          );

          setSelectedMaterial(
            (previous) =>
              previous?.id === id
                ? null
                : previous,
          );

          setModules([]);
          setSections([]);
          setExtraction(null);
          setModuleFileExtraction(null);
        } catch (err) {
          const normalizedError =
            normalizeError(
              err,
              "Failed to delete learning material.",
            );

          setError(
            normalizedError.message,
          );

          throw normalizedError;
        } finally {
          setIsSaving(false);
        }
      },
      [api],
    );

  // ==========================================
  // PUBLISH LEARNING MATERIAL
  // ==========================================

  const publishLearningMaterial =
    useCallback(
      async (id: string) => {
        try {
          setIsSaving(true);
          setError(null);

          const result =
            await api.publish(id);

          setLearningMaterials(
            (previous) =>
              previous.map(
                (material) =>
                  material.id === id
                    ? result
                    : material,
              ),
          );

          setSelectedMaterial(
            (previous) =>
              previous?.id === id
                ? result
                : previous,
          );

          return result;
        } catch (err) {
          const normalizedError =
            normalizeError(
              err,
              "Failed to publish learning material.",
            );

          setError(
            normalizedError.message,
          );

          throw normalizedError;
        } finally {
          setIsSaving(false);
        }
      },
      [api],
    );

  // ==========================================
  // UPLOAD LEARNING MATERIAL FILE
  // ==========================================

  const uploadLearningMaterial =
    useCallback(
      async (
        id: string,
        file: File,
      ) => {
        try {
          setIsUploading(true);
          setError(null);

          const result =
            await api.uploadFile(
              id,
              file,
            );

          setLearningMaterials(
            (previous) =>
              previous.map(
                (material) =>
                  material.id === id
                    ? result
                    : material,
              ),
          );

          setSelectedMaterial(
            (previous) =>
              previous?.id === id
                ? result
                : previous,
          );

          setExtraction(null);

          return result;
        } catch (err) {
          const normalizedError =
            normalizeError(
              err,
              "Failed to upload learning material file.",
            );

          setError(
            normalizedError.message,
          );

          throw normalizedError;
        } finally {
          setIsUploading(false);
        }
      },
      [api],
    );

  // ==========================================
  // EXTRACT LEARNING MATERIAL TEXT
  // ==========================================

  const extractLearningMaterialText =
    useCallback(
      async (id: string) => {
        try {
          setIsExtracting(true);
          setError(null);

          const result =
            await api.extractText(id);

          setExtraction(result);

          setSelectedMaterial(
            (previous) =>
              previous?.id === id
                ? {
                    ...previous,
                    extractedText:
                      result.text,
                  }
                : previous,
          );

          setLearningMaterials(
            (previous) =>
              previous.map(
                (material) =>
                  material.id === id
                    ? {
                        ...material,
                        extractedText:
                          result.text,
                      }
                    : material,
              ),
          );

          return result;
        } catch (err) {
          const normalizedError =
            normalizeError(
              err,
              "Failed to extract learning material text.",
            );

          setError(
            normalizedError.message,
          );

          throw normalizedError;
        } finally {
          setIsExtracting(false);
        }
      },
      [api],
    );

  // ==========================================
  // LOAD MODULES
  // ==========================================

  const loadModules =
    useCallback(
      async (
        learningMaterialId: string,
      ) => {
        try {
          setIsLoading(true);
          setError(null);

          const result =
            await api.getModules(
              learningMaterialId,
            );

          const sortedModules =
            [...result].sort(
              (a, b) =>
                a.displayOrder -
                  b.displayOrder ||
                a.moduleNumber -
                  b.moduleNumber,
            );

          setModules(sortedModules);

          setSections([]);
          setModuleFileExtraction(null);

          return sortedModules;
        } catch (err) {
          const normalizedError =
            normalizeError(
              err,
              "Failed to load learning modules.",
            );

          setError(
            normalizedError.message,
          );

          throw normalizedError;
        } finally {
          setIsLoading(false);
        }
      },
      [api],
    );

  // ==========================================
  // CREATE MODULE
  // ==========================================

  const createLearningModule =
    useCallback(
      async (
        request: CreateLearningModuleRequest,
      ) => {
        try {
          setIsSaving(true);
          setError(null);

          const result =
            await api.createModule(
              request,
            );

          setModules(
            (previous) =>
              [
                ...previous,
                result,
              ].sort(
                (a, b) =>
                  a.displayOrder -
                    b.displayOrder ||
                  a.moduleNumber -
                    b.moduleNumber,
              ),
          );

          setSections([]);
          setModuleFileExtraction(null);

          return result;
        } catch (err) {
          const normalizedError =
            normalizeError(
              err,
              "Failed to create learning module.",
            );

          setError(
            normalizedError.message,
          );

          throw normalizedError;
        } finally {
          setIsSaving(false);
        }
      },
      [api],
    );

  // ==========================================
  // UPDATE MODULE
  // ==========================================

  const updateLearningModule =
    useCallback(
      async (
        moduleId: string,
        request: UpdateLearningModuleRequest,
      ) => {
        try {
          setIsSaving(true);
          setError(null);

          const result =
            await api.updateModule(
              moduleId,
              request,
            );

          setModules(
            (previous) =>
              previous
                .map((module) =>
                  module.id === moduleId
                    ? result
                    : module,
                )
                .sort(
                  (a, b) =>
                    a.displayOrder -
                      b.displayOrder ||
                    a.moduleNumber -
                      b.moduleNumber,
                ),
          );

          return result;
        } catch (err) {
          const normalizedError =
            normalizeError(
              err,
              "Failed to update learning module.",
            );

          setError(
            normalizedError.message,
          );

          throw normalizedError;
        } finally {
          setIsSaving(false);
        }
      },
      [api],
    );

  // ==========================================
  // DELETE MODULE
  // ==========================================

  const deleteLearningModule =
    useCallback(
      async (moduleId: string) => {
        try {
          setIsSaving(true);
          setError(null);

          await api.deleteModule(
            moduleId,
          );

          setModules(
            (previous) =>
              previous.filter(
                (module) =>
                  module.id !== moduleId,
              ),
          );

          setSections([]);
          setModuleFileExtraction(null);
        } catch (err) {
          const normalizedError =
            normalizeError(
              err,
              "Failed to delete learning module.",
            );

          setError(
            normalizedError.message,
          );

          throw normalizedError;
        } finally {
          setIsSaving(false);
        }
      },
      [api],
    );

  // ==========================================
  // UPLOAD MODULE FILE
  // ==========================================

  const uploadLearningModuleFile =
    useCallback(
      async (
        moduleId: string,
        file: File,
      ): Promise<LearningModuleFile> => {
        try {
          setIsUploadingModule(true);
          setError(null);

          const result =
            await api.uploadModuleFile(
              moduleId,
              file,
            );

          /*
           * IMPORTANT:
           *
           * Backend now returns LearningModuleFile,
           * NOT LearningModule.
           *
           * Therefore we update only the files[]
           * inside the matching module.
           */

          setModules(
            (previous) =>
              previous.map((module) =>
                module.id === moduleId
                  ? {
                      ...module,
                      files:
                        module.files.some(
                          (existingFile) =>
                            existingFile.id ===
                            result.id,
                        )
                          ? module.files.map(
                              (existingFile) =>
                                existingFile.id ===
                                result.id
                                  ? result
                                  : existingFile,
                            )
                          : [
                              ...module.files,
                              result,
                            ],
                    }
                  : module,
              ),
          );

          setModuleFileExtraction(null);

          return result;
        } catch (err) {
          const normalizedError =
            normalizeError(
              err,
              "Failed to upload learning module file.",
            );

          setError(
            normalizedError.message,
          );

          throw normalizedError;
        } finally {
          setIsUploadingModule(false);
        }
      },
      [api],
    );

  // ==========================================
  // EXTRACT ONE MODULE FILE
  // ==========================================

  const extractLearningModuleFileText =
    useCallback(
      async (
        moduleId: string,
        moduleFileId: string,
      ): Promise<LearningModuleFileExtraction> => {
        try {
          setIsExtractingModule(true);
          setError(null);

          const result =
            await api.extractModuleFileText(
              moduleId,
              moduleFileId,
            );

          setModuleFileExtraction(
            result,
          );

          /*
           * Synchronize extracted text
           * into the correct module file.
           */

          setModules(
            (previous) =>
              previous.map((module) =>
                module.id === moduleId
                  ? {
                      ...module,
                      files:
                        module.files.map(
                          (file) =>
                            file.id ===
                            moduleFileId
                              ? {
                                  ...file,
                                  extractedText:
                                    result.text,
                                }
                              : file,
                        ),
                    }
                  : module,
              ),
          );

          return result;
        } catch (err) {
          const normalizedError =
            normalizeError(
              err,
              "Failed to extract learning module file text.",
            );

          setError(
            normalizedError.message,
          );

          throw normalizedError;
        } finally {
          setIsExtractingModule(false);
        }
      },
      [api],
    );

  // ==========================================
  // EXTRACT ALL MODULE FILES
  // ==========================================

  const extractAllLearningModuleFiles =
    useCallback(
      async (
        moduleId: string,
      ): Promise<ExtractAllLearningModuleFilesResponse> => {
        try {
          setIsExtractingModule(true);
          setError(null);

          const result =
            await api.extractAllModuleFiles(
              moduleId,
            );

          /*
           * Backend returns only:
           *
           * {
           *   success: true,
           *   message: "..."
           * }
           *
           * So we don't modify files[]
           * here because the response does not
           * contain the extracted text.
           *
           * The page/modal can reload the module
           * after this operation.
           */

          return result;
        } catch (err) {
          const normalizedError =
            normalizeError(
              err,
              "Failed to extract all learning module files.",
            );

          setError(
            normalizedError.message,
          );

          throw normalizedError;
        } finally {
          setIsExtractingModule(false);
        }
      },
      [api],
    );

  // ==========================================
  // GENERATE MODULE AI CONTENT
  // ==========================================

  const generateModuleAiContent =
    useCallback(
      async (moduleId: string) => {
        if (!moduleId) {
          const generationError =
            new Error(
              "Cannot generate AI content: module ID is missing.",
            );

          setError(
            generationError.message,
          );

          throw generationError;
        }

        try {
          setIsGenerating(true);
          setError(null);

          const result =
            await api.generateModuleAiContent(
              moduleId,
            );

          /*
           * Backend returns the complete
           * LearningModule including:
           *
           * - files
           * - welcomeContent
           * - learningObjectives
           * - summary
           * - keyTakeaways
           * - sectionCount
           */

          setModules(
            (previous) =>
              previous
                .map((module) =>
                  module.id === moduleId
                    ? result
                    : module,
                )
                .sort(
                  (a, b) =>
                    a.displayOrder -
                      b.displayOrder ||
                    a.moduleNumber -
                      b.moduleNumber,
                ),
          );

          return result;
        } catch (err) {
          const normalizedError =
            normalizeError(
              err,
              "Failed to generate AI module content.",
            );

          console.error(
            "[LearningMaterials] AI generation failed:",
            normalizedError,
          );

          setError(
            normalizedError.message,
          );

          throw normalizedError;
        } finally {
          setIsGenerating(false);
        }
      },
      [api],
    );

  // ==========================================
  // LOAD SECTIONS
  // ==========================================

  const loadSections =
    useCallback(
      async (moduleId: string) => {
        try {
          setIsLoading(true);
          setError(null);

          const result =
            await api.getSections(
              moduleId,
            );

          const sortedSections =
            [...result].sort(
              (a, b) =>
                a.displayOrder -
                  b.displayOrder ||
                a.sectionNumber -
                  b.sectionNumber,
            );

          setSections(
            sortedSections,
          );

          return sortedSections;
        } catch (err) {
          const normalizedError =
            normalizeError(
              err,
              "Failed to load learning sections.",
            );

          setError(
            normalizedError.message,
          );

          throw normalizedError;
        } finally {
          setIsLoading(false);
        }
      },
      [api],
    );

  // ==========================================
  // CREATE SECTION
  // ==========================================

  const createLearningSection =
    useCallback(
      async (
        request: CreateLearningSectionRequest,
      ) => {
        try {
          setIsSaving(true);
          setError(null);

          const result =
            await api.createSection(
              request,
            );

          setSections(
            (previous) =>
              [
                ...previous,
                result,
              ].sort(
                (a, b) =>
                  a.displayOrder -
                    b.displayOrder ||
                  a.sectionNumber -
                    b.sectionNumber,
              ),
          );

          return result;
        } catch (err) {
          const normalizedError =
            normalizeError(
              err,
              "Failed to create learning section.",
            );

          setError(
            normalizedError.message,
          );

          throw normalizedError;
        } finally {
          setIsSaving(false);
        }
      },
      [api],
    );

  // ==========================================
  // UPDATE SECTION
  // ==========================================

  const updateLearningSection =
    useCallback(
      async (
        sectionId: string,
        request: UpdateLearningSectionRequest,
      ) => {
        try {
          setIsSaving(true);
          setError(null);

          const result =
            await api.updateSection(
              sectionId,
              request,
            );

          setSections(
            (previous) =>
              previous
                .map((section) =>
                  section.id === sectionId
                    ? result
                    : section,
                )
                .sort(
                  (a, b) =>
                    a.displayOrder -
                      b.displayOrder ||
                    a.sectionNumber -
                      b.sectionNumber,
                ),
          );

          return result;
        } catch (err) {
          const normalizedError =
            normalizeError(
              err,
              "Failed to update learning section.",
            );

          setError(
            normalizedError.message,
          );

          throw normalizedError;
        } finally {
          setIsSaving(false);
        }
      },
      [api],
    );

  // ==========================================
  // DELETE SECTION
  // ==========================================

  const deleteLearningSection =
    useCallback(
      async (sectionId: string) => {
        try {
          setIsSaving(true);
          setError(null);

          await api.deleteSection(
            sectionId,
          );

          setSections(
            (previous) =>
              previous.filter(
                (section) =>
                  section.id !== sectionId,
              ),
          );
        } catch (err) {
          const normalizedError =
            normalizeError(
              err,
              "Failed to delete learning section.",
            );

          setError(
            normalizedError.message,
          );

          throw normalizedError;
        } finally {
          setIsSaving(false);
        }
      },
      [api],
    );

  // ==========================================
  // CLEAR ERROR
  // ==========================================

  const clearError =
    useCallback(() => {
      setError(null);
    }, []);

  // ==========================================
  // CLEAR MATERIAL EXTRACTION
  // ==========================================

  const clearExtraction =
    useCallback(() => {
      setExtraction(null);
    }, []);

  // ==========================================
  // CLEAR MODULE FILE EXTRACTION
  // ==========================================

  const clearModuleFileExtraction =
    useCallback(() => {
      setModuleFileExtraction(null);
    }, []);

  // ==========================================
  // RETURN
  // ==========================================

  return {
    // ==========================================
    // LEARNING MATERIAL STATE
    // ==========================================

    learningMaterials,
    selectedMaterial,
    extraction,

    // ==========================================
    // MODULE STATE
    // ==========================================

    modules,
    moduleFileExtraction,

    // ==========================================
    // SECTION STATE
    // ==========================================

    sections,

    // ==========================================
    // GENERAL STATE
    // ==========================================

    isLoading,
    isSaving,
    isUploading,
    isGenerating,
    isExtracting,

    // ==========================================
    // MODULE FILE STATE
    // ==========================================

    isUploadingModule,
    isExtractingModule,

    // ==========================================
    // ERROR
    // ==========================================

    error,

    // ==========================================
    // LEARNING MATERIAL ACTIONS
    // ==========================================

    loadLearningMaterials,
    loadLearningMaterial,
    createLearningMaterial,
    updateLearningMaterial,
    deleteLearningMaterial,
    publishLearningMaterial,
    uploadLearningMaterial,
    extractLearningMaterialText,

    // ==========================================
    // MODULE ACTIONS
    // ==========================================

    loadModules,
    createLearningModule,
    updateLearningModule,
    deleteLearningModule,

    // ==========================================
    // MODULE FILE ACTIONS
    // ==========================================

    uploadLearningModuleFile,
    extractLearningModuleFileText,
    extractAllLearningModuleFiles,

    // ==========================================
    // AI ACTIONS
    // ==========================================

    generateModuleAiContent,

    // ==========================================
    // SECTION ACTIONS
    // ==========================================

    loadSections,
    createLearningSection,
    updateLearningSection,
    deleteLearningSection,

    // ==========================================
    // UTILITY
    // ==========================================

    clearError,
    clearExtraction,
    clearModuleFileExtraction,
  };
}