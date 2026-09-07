"use client";

import {
  useCallback,
  useState,
} from "react";

import type {
  CreateLearningMaterialRequest,
  CreateLearningModuleRequest,
  CreateLearningSectionRequest,
  LearningMaterial,
  LearningMaterialExtraction,
  LearningModule,
  LearningSection,
  UpdateLearningMaterialRequest,
  UpdateLearningModuleRequest,
  UpdateLearningSectionRequest,
} from "@repo/types";


// ============================================================
// API CONTRACT
// ============================================================

export interface LearningMaterialApi {
  // ==========================================================
  // LEARNING MATERIAL
  // ==========================================================

  getByBatchId(
    batchId: string,
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

  // ==========================================================
  // FILE
  // ==========================================================

  uploadFile(
    id: string,
    file: File,
  ): Promise<LearningMaterial>;

  extractText(
    id: string,
  ): Promise<LearningMaterialExtraction>;

  generateModules(
    id: string,
  ): Promise<LearningModule[]>;

  // ==========================================================
  // MODULE
  // ==========================================================

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

  // ==========================================================
  // SECTION
  // ==========================================================

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


// ============================================================
// HOOK
// ============================================================

export function useLearningMaterials(
  api: LearningMaterialApi,
) {

  // ==========================================================
  // STATE
  // ==========================================================

  const [
    learningMaterials,
    setLearningMaterials,
  ] = useState<LearningMaterial[]>([]);

  const [
    selectedMaterial,
    setSelectedMaterial,
  ] = useState<LearningMaterial | null>(null);

  const [
    modules,
    setModules,
  ] = useState<LearningModule[]>([]);

  const [
    sections,
    setSections,
  ] = useState<LearningSection[]>([]);

  const [
    extraction,
    setExtraction,
  ] = useState<LearningMaterialExtraction | null>(
    null,
  );

  const [
    isLoading,
    setIsLoading,
  ] = useState(false);

  const [
    isSaving,
    setIsSaving,
  ] = useState(false);

  const [
    isUploading,
    setIsUploading,
  ] = useState(false);

  const [
    isGenerating,
    setIsGenerating,
  ] = useState(false);

  const [
    isExtracting,
    setIsExtracting,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<Error | null>(null);


  // ==========================================================
  // NORMALIZE ERROR
  // ==========================================================

  const normalizeError = (
    err: unknown,
    fallbackMessage: string,
  ) => {

    return err instanceof Error
      ? err
      : new Error(fallbackMessage);
  };


  // ==========================================================
  // GET MATERIALS BY BATCH
  // ==========================================================

  const loadLearningMaterials =
    useCallback(
      async (
        batchId: string,
      ) => {

        try {

          setIsLoading(true);
          setError(null);

          const result =
            await api.getByBatchId(
              batchId,
            );

          setLearningMaterials(
            result,
          );

          return result;

        } catch (err) {

          const normalizedError =
            normalizeError(
              err,
              "Failed to load learning materials.",
            );

          setError(
            normalizedError,
          );

          throw normalizedError;

        } finally {

          setIsLoading(false);
        }

      },
      [api],
    );


  // ==========================================================
  // GET MATERIAL BY ID
  // ==========================================================

  const loadLearningMaterial =
    useCallback(
      async (
        id: string,
      ) => {

        try {

          setIsLoading(true);
          setError(null);

          const result =
            await api.getById(
              id,
            );

          setSelectedMaterial(
            result,
          );

          return result;

        } catch (err) {

          const normalizedError =
            normalizeError(
              err,
              "Failed to load learning material.",
            );

          setError(
            normalizedError,
          );

          throw normalizedError;

        } finally {

          setIsLoading(false);
        }

      },
      [api],
    );


  // ==========================================================
  // CREATE
  // ==========================================================

  const createLearningMaterial =
    useCallback(
      async (
        request: CreateLearningMaterialRequest,
      ) => {

        try {

          setIsSaving(true);
          setError(null);

          const result =
            await api.create(
              request,
            );

          setLearningMaterials(
            previous => [
              ...previous,
              result,
            ],
          );

          setSelectedMaterial(
            result,
          );

          return result;

        } catch (err) {

          const normalizedError =
            normalizeError(
              err,
              "Failed to create learning material.",
            );

          setError(
            normalizedError,
          );

          throw normalizedError;

        } finally {

          setIsSaving(false);
        }

      },
      [api],
    );


  // ==========================================================
  // UPDATE
  // ==========================================================

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
            previous =>
              previous.map(
                material =>
                  material.id === id
                    ? result
                    : material,
              ),
          );

          setSelectedMaterial(
            result,
          );

          return result;

        } catch (err) {

          const normalizedError =
            normalizeError(
              err,
              "Failed to update learning material.",
            );

          setError(
            normalizedError,
          );

          throw normalizedError;

        } finally {

          setIsSaving(false);
        }

      },
      [api],
    );


  // ==========================================================
  // DELETE
  // ==========================================================

  const deleteLearningMaterial =
    useCallback(
      async (
        id: string,
      ) => {

        try {

          setIsSaving(true);
          setError(null);

          await api.delete(
            id,
          );

          setLearningMaterials(
            previous =>
              previous.filter(
                material =>
                  material.id !== id,
              ),
          );

          setSelectedMaterial(
            previous =>
              previous?.id === id
                ? null
                : previous,
          );

        } catch (err) {

          const normalizedError =
            normalizeError(
              err,
              "Failed to delete learning material.",
            );

          setError(
            normalizedError,
          );

          throw normalizedError;

        } finally {

          setIsSaving(false);
        }

      },
      [api],
    );


  // ==========================================================
  // PUBLISH
  // ==========================================================

  const publishLearningMaterial =
    useCallback(
      async (
        id: string,
      ) => {

        try {

          setIsSaving(true);
          setError(null);

          const result =
            await api.publish(
              id,
            );

          setLearningMaterials(
            previous =>
              previous.map(
                material =>
                  material.id === id
                    ? result
                    : material,
              ),
          );

          setSelectedMaterial(
            result,
          );

          return result;

        } catch (err) {

          const normalizedError =
            normalizeError(
              err,
              "Failed to publish learning material.",
            );

          setError(
            normalizedError,
          );

          throw normalizedError;

        } finally {

          setIsSaving(false);
        }

      },
      [api],
    );


  // ==========================================================
  // UPLOAD FILE
  // ==========================================================

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
            previous =>
              previous.map(
                material =>
                  material.id === id
                    ? result
                    : material,
              ),
          );

          setSelectedMaterial(
            result,
          );

          return result;

        } catch (err) {

          const normalizedError =
            normalizeError(
              err,
              "Failed to upload learning material.",
            );

          setError(
            normalizedError,
          );

          throw normalizedError;

        } finally {

          setIsUploading(false);
        }

      },
      [api],
    );


  // ==========================================================
  // EXTRACT TEXT
  // ==========================================================

  const extractLearningMaterialText =
    useCallback(
      async (
        id: string,
      ) => {

        try {

          setIsExtracting(true);
          setError(null);

          const result =
            await api.extractText(
              id,
            );

          setExtraction(
            result,
          );

          return result;

        } catch (err) {

          const normalizedError =
            normalizeError(
              err,
              "Failed to extract learning material text.",
            );

          setError(
            normalizedError,
          );

          throw normalizedError;

        } finally {

          setIsExtracting(false);
        }

      },
      [api],
    );


  // ==========================================================
  // GENERATE MODULES
  // ==========================================================

  const generateLearningModules =
    useCallback(
      async (
        id: string,
      ) => {

        try {

          setIsGenerating(true);
          setError(null);

          const result =
            await api.generateModules(
              id,
            );

          setModules(
            result,
          );

          return result;

        } catch (err) {

          const normalizedError =
            normalizeError(
              err,
              "Failed to generate learning modules.",
            );

          setError(
            normalizedError,
          );

          throw normalizedError;

        } finally {

          setIsGenerating(false);
        }

      },
      [api],
    );


  // ==========================================================
  // LOAD MODULES
  // ==========================================================

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

          setModules(
            result,
          );

          return result;

        } catch (err) {

          const normalizedError =
            normalizeError(
              err,
              "Failed to load learning modules.",
            );

          setError(
            normalizedError,
          );

          throw normalizedError;

        } finally {

          setIsLoading(false);
        }

      },
      [api],
    );


  // ==========================================================
  // CREATE MODULE
  // ==========================================================

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
            previous => [
              ...previous,
              result,
            ],
          );

          return result;

        } catch (err) {

          const normalizedError =
            normalizeError(
              err,
              "Failed to create learning module.",
            );

          setError(
            normalizedError,
          );

          throw normalizedError;

        } finally {

          setIsSaving(false);
        }

      },
      [api],
    );


  // ==========================================================
  // UPDATE MODULE
  // ==========================================================

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
            previous =>
              previous.map(
                module =>
                  module.id === moduleId
                    ? result
                    : module,
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
            normalizedError,
          );

          throw normalizedError;

        } finally {

          setIsSaving(false);
        }

      },
      [api],
    );


  // ==========================================================
  // DELETE MODULE
  // ==========================================================

  const deleteLearningModule =
    useCallback(
      async (
        moduleId: string,
      ) => {

        try {

          setIsSaving(true);
          setError(null);

          await api.deleteModule(
            moduleId,
          );

          setModules(
            previous =>
              previous.filter(
                module =>
                  module.id !== moduleId,
              ),
          );

          setSections(
            [],
          );

        } catch (err) {

          const normalizedError =
            normalizeError(
              err,
              "Failed to delete learning module.",
            );

          setError(
            normalizedError,
          );

          throw normalizedError;

        } finally {

          setIsSaving(false);
        }

      },
      [api],
    );


  // ==========================================================
  // LOAD SECTIONS
  // ==========================================================

  const loadSections =
    useCallback(
      async (
        moduleId: string,
      ) => {

        try {

          setIsLoading(true);
          setError(null);

          const result =
            await api.getSections(
              moduleId,
            );

          setSections(
            result,
          );

          return result;

        } catch (err) {

          const normalizedError =
            normalizeError(
              err,
              "Failed to load learning sections.",
            );

          setError(
            normalizedError,
          );

          throw normalizedError;

        } finally {

          setIsLoading(false);
        }

      },
      [api],
    );


  // ==========================================================
  // CREATE SECTION
  // ==========================================================

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
            previous => [
              ...previous,
              result,
            ],
          );

          return result;

        } catch (err) {

          const normalizedError =
            normalizeError(
              err,
              "Failed to create learning section.",
            );

          setError(
            normalizedError,
          );

          throw normalizedError;

        } finally {

          setIsSaving(false);
        }

      },
      [api],
    );


  // ==========================================================
  // UPDATE SECTION
  // ==========================================================

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
            previous =>
              previous.map(
                section =>
                  section.id === sectionId
                    ? result
                    : section,
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
            normalizedError,
          );

          throw normalizedError;

        } finally {

          setIsSaving(false);
        }

      },
      [api],
    );


  // ==========================================================
  // DELETE SECTION
  // ==========================================================

  const deleteLearningSection =
    useCallback(
      async (
        sectionId: string,
      ) => {

        try {

          setIsSaving(true);
          setError(null);

          await api.deleteSection(
            sectionId,
          );

          setSections(
            previous =>
              previous.filter(
                section =>
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
            normalizedError,
          );

          throw normalizedError;

        } finally {

          setIsSaving(false);
        }

      },
      [api],
    );


  // ==========================================================
  // RETURN
  // ==========================================================

  return {
    // ----------------------------------------------------------
    // STATE
    // ----------------------------------------------------------

    learningMaterials,

    selectedMaterial,

    modules,

    sections,

    extraction,

    isLoading,

    isSaving,

    isUploading,

    isGenerating,

    isExtracting,

    error,

    // ----------------------------------------------------------
    // LEARNING MATERIAL
    // ----------------------------------------------------------

    loadLearningMaterials,

    loadLearningMaterial,

    createLearningMaterial,

    updateLearningMaterial,

    deleteLearningMaterial,

    publishLearningMaterial,

    // ----------------------------------------------------------
    // FILE
    // ----------------------------------------------------------

    uploadLearningMaterial,

    extractLearningMaterialText,

    generateLearningModules,

    // ----------------------------------------------------------
    // MODULE
    // ----------------------------------------------------------

    loadModules,

    createLearningModule,

    updateLearningModule,

    deleteLearningModule,

    // ----------------------------------------------------------
    // SECTION
    // ----------------------------------------------------------

    loadSections,

    createLearningSection,

    updateLearningSection,

    deleteLearningSection,
  };
}