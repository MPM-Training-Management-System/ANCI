import { useState } from "react";

import {
  LearningProgressApi,
} from "@repo/api";

import type {
  LearningMaterialProgress,
} from "@repo/types";


// ============================================================
// LEARNING PROGRESS HOOK
// ============================================================

export function useLearningProgress(
  learningProgressApi: LearningProgressApi,
) {
  const [progress, setProgress] =
    useState<LearningMaterialProgress | null>(null);

  const [isLoading, setIsLoading] =
    useState(false);

  const [isCompleting, setIsCompleting] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);


  // ==========================================================
  // GET MATERIAL PROGRESS
  // ==========================================================

  const getMaterialProgress = async (
    materialId: string,
  ) => {
    try {
      setIsLoading(true);
      setError(null);

      const response =
        await learningProgressApi.getMaterialProgress(
          materialId,
        );

      setProgress(response);

      return response;

    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load learning progress right now.",
      );

      return null;

    } finally {
      setIsLoading(false);
    }
  };


  // ==========================================================
  // COMPLETE SECTION
  //
  // Called when participant presses NEXT.
  // ==========================================================

  const completeSection = async (
    sectionId: string,
  ) => {
    try {
      setIsCompleting(true);
      setError(null);

      const response =
        await learningProgressApi.completeSection(
          sectionId,
        );

      setProgress(response);

      return response;

    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to save your learning progress right now.",
      );

      return null;

    } finally {
      setIsCompleting(false);
    }
  };


  // ==========================================================
  // RESET
  // ==========================================================

  const reset = () => {
    setProgress(null);
    setIsLoading(false);
    setIsCompleting(false);
    setError(null);
  };


  return {
    progress,

    isLoading,
    isCompleting,

    error,

    getMaterialProgress,
    completeSection,

    reset,
  };
}