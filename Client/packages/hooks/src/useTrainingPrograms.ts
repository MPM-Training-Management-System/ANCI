"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import type {
  TrainingProgram,
  CreateTrainingProgramRequest,
  UpdateTrainingProgramRequest,
} from "@repo/types";

import type {
  TrainingProgramApi,
} from "@repo/api";


export function useTrainingPrograms(
  trainingProgramApi: TrainingProgramApi
) {
  // =========================================================
  // STATE
  // =========================================================

  const [
    programs,
    setPrograms,
  ] = useState<TrainingProgram[]>([]);

  const [
    selectedProgram,
    setSelectedProgram,
  ] = useState<TrainingProgram | null>(null);

  const [
    isLoading,
    setIsLoading,
  ] = useState(false);

  const [
    isCreating,
    setIsCreating,
  ] = useState(false);

  const [
    isUpdating,
    setIsUpdating,
  ] = useState(false);

  const [
    isDeleting,
    setIsDeleting,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(null);


  // =========================================================
  // LOAD ALL TRAINING PROGRAMS
  // =========================================================

  const loadPrograms = useCallback(
    async () => {
      try {
        setIsLoading(true);
        setError(null);

        const result =
          await trainingProgramApi.getAll();

        setPrograms(
          Array.isArray(result)
            ? result
            : []
        );

      } catch (error) {
        console.error(
          "LOAD TRAINING PROGRAMS ERROR:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load training programs."
        );

        setPrograms([]);

      } finally {
        setIsLoading(false);
      }
    },
    [
      trainingProgramApi,
    ]
  );


  // =========================================================
  // LOAD TRAINING PROGRAM BY ID
  // =========================================================

  const getProgram = useCallback(
    async (id: string) => {
      try {
        setError(null);

        const result =
          await trainingProgramApi.getById(
            id
          );

        setSelectedProgram(result);

        return result;

      } catch (error) {
        console.error(
          "GET TRAINING PROGRAM ERROR:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load training program."
        );

        return null;
      }
    },
    [
      trainingProgramApi,
    ]
  );


  // =========================================================
  // CREATE TRAINING PROGRAM
  // =========================================================

  const createProgram = useCallback(
    async (
      request: CreateTrainingProgramRequest
    ) => {
      try {
        setIsCreating(true);
        setError(null);

        const result =
          await trainingProgramApi.create(
            request
          );

        await loadPrograms();

        return result;

      } catch (error) {
        console.error(
          "CREATE TRAINING PROGRAM ERROR:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Unable to create training program."
        );

        return null;

      } finally {
        setIsCreating(false);
      }
    },
    [
      trainingProgramApi,
      loadPrograms,
    ]
  );


  // =========================================================
  // UPDATE TRAINING PROGRAM
  // =========================================================

  const updateProgram = useCallback(
    async (
      id: string,
      request: UpdateTrainingProgramRequest
    ) => {
      try {
        setIsUpdating(true);
        setError(null);

        await trainingProgramApi.update(
          id,
          request
        );

        await loadPrograms();

        if (
          selectedProgram?.id === id
        ) {
          await getProgram(id);
        }

        return true;

      } catch (error) {
        console.error(
          "UPDATE TRAINING PROGRAM ERROR:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Unable to update training program."
        );

        return false;

      } finally {
        setIsUpdating(false);
      }
    },
    [
      trainingProgramApi,
      loadPrograms,
      getProgram,
      selectedProgram?.id,
    ]
  );


  // =========================================================
  // DELETE TRAINING PROGRAM
  // =========================================================

  const deleteProgram = useCallback(
    async (id: string) => {
      try {
        setIsDeleting(true);
        setError(null);

        await trainingProgramApi.delete(
          id
        );

        setPrograms(
          (currentPrograms) =>
            currentPrograms.filter(
              (program) =>
                program.id !== id
            )
        );

        if (
          selectedProgram?.id === id
        ) {
          setSelectedProgram(null);
        }

        return true;

      } catch (error) {
        console.error(
          "DELETE TRAINING PROGRAM ERROR:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Unable to delete training program."
        );

        return false;

      } finally {
        setIsDeleting(false);
      }
    },
    [
      trainingProgramApi,
      selectedProgram?.id,
    ]
  );


  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    loadPrograms();
  }, [
    loadPrograms,
  ]);


  // =========================================================
  // RESET
  // =========================================================

  const reset = useCallback(() => {
    setPrograms([]);
    setSelectedProgram(null);
    setIsLoading(false);
    setIsCreating(false);
    setIsUpdating(false);
    setIsDeleting(false);
    setError(null);
  }, []);


  // =========================================================
  // RETURN
  // =========================================================

  return {
    // Data
    programs,
    selectedProgram,

    // Setters
    setSelectedProgram,

    // Loading states
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,

    // Error
    error,

    // Actions
    loadPrograms,
    getProgram,
    createProgram,
    updateProgram,
    deleteProgram,

    // Reset
    reset,
  };
}