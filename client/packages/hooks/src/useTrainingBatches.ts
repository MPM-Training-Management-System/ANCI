
"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import type {
  TrainingBatch,
  CreateTrainingBatchRequest,
  UpdateTrainingBatchRequest,
  UpdateTrainingBatchStatusRequest,
  TrainingScheduleRecommendation,
  GenerateTrainingScheduleRequest,
  CreateManualTrainingScheduleRequest,
  TrainingSession,
} from "@repo/types";

import type {
  TrainingBatchApi,
} from "@repo/api";

export function useTrainingBatches(
  trainingBatchApi: TrainingBatchApi,
) {
  // =========================================================
  // DATA
  // =========================================================

  const [batches, setBatches] =
    useState<TrainingBatch[]>([]);

  const [selectedBatch, setSelectedBatch] =
    useState<TrainingBatch | null>(null);

  // =========================================================
  // TRAINING SCHEDULE DATA
  // =========================================================

  const [scheduleRecommendation, setScheduleRecommendation] =
    useState<TrainingScheduleRecommendation | null>(null);

  const [trainingSessions, setTrainingSessions] =
    useState<TrainingSession[]>([]);

  // =========================================================
  // LOADING STATES
  // =========================================================

  const [isLoading, setIsLoading] =
    useState(false);

  const [isCreating, setIsCreating] =
    useState(false);

  const [isUpdating, setIsUpdating] =
    useState(false);

  const [isUpdatingStatus, setIsUpdatingStatus] =
    useState(false);

  const [isDeleting, setIsDeleting] =
    useState(false);

  const [isLoadingSchedule, setIsLoadingSchedule] =
    useState(false);

  const [isGeneratingSchedule, setIsGeneratingSchedule] =
    useState(false);

  const [isCreatingManualSchedule, setIsCreatingManualSchedule] =
    useState(false);

  const [isApprovingSchedule, setIsApprovingSchedule] =
    useState(false);

  // =========================================================
  // ERRORS
  // =========================================================

  const [error, setError] =
    useState<string | null>(null);

  const [scheduleError, setScheduleError] =
    useState<string | null>(null);

  // =========================================================
  // LOAD ALL TRAINING BATCHES
  // =========================================================

  const loadBatches = useCallback(
    async (): Promise<TrainingBatch[]> => {
      try {
        setIsLoading(true);
        setError(null);

        const result =
          await trainingBatchApi.getAll();

        const data = Array.isArray(result)
          ? result
          : [];

        setBatches(data);

        return data;
      } catch (error) {
        console.error(
          "LOAD TRAINING BATCHES ERROR:",
          error,
        );

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load training batches.",
        );

        setBatches([]);

        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [trainingBatchApi],
  );

  // =========================================================
  // GET TRAINING BATCH BY ID
  // =========================================================

  const getBatch = useCallback(
    async (
      id: string,
    ): Promise<TrainingBatch | null> => {
      try {
        setError(null);

        const result =
          await trainingBatchApi.getById(id);

        setSelectedBatch(result);

        return result;
      } catch (error) {
        console.error(
          "GET TRAINING BATCH ERROR:",
          error,
        );

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load training batch.",
        );

        return null;
      }
    },
    [trainingBatchApi],
  );

  // =========================================================
  // CREATE TRAINING BATCH
  // =========================================================

  const createBatch = useCallback(
    async (
      request: CreateTrainingBatchRequest,
    ): Promise<TrainingBatch | null> => {
      try {
        setIsCreating(true);
        setError(null);

        const result =
          await trainingBatchApi.create(request);

        await loadBatches();

        return result;
      } catch (error) {
        console.error(
          "CREATE TRAINING BATCH ERROR:",
          error,
        );

        setError(
          error instanceof Error
            ? error.message
            : "Unable to create training batch.",
        );

        return null;
      } finally {
        setIsCreating(false);
      }
    },
    [trainingBatchApi, loadBatches],
  );

  // =========================================================
  // UPDATE TRAINING BATCH
  // =========================================================

  const updateBatch = useCallback(
    async (
      id: string,
      request: UpdateTrainingBatchRequest,
    ): Promise<boolean> => {
      try {
        setIsUpdating(true);
        setError(null);

        await trainingBatchApi.update(
          id,
          request,
        );

        await loadBatches();

        if (selectedBatch?.id === id) {
          await getBatch(id);
        }

        return true;
      } catch (error) {
        console.error(
          "UPDATE TRAINING BATCH ERROR:",
          error,
        );

        setError(
          error instanceof Error
            ? error.message
            : "Unable to update training batch.",
        );

        return false;
      } finally {
        setIsUpdating(false);
      }
    },
    [
      trainingBatchApi,
      loadBatches,
      getBatch,
      selectedBatch?.id,
    ],
  );

  // =========================================================
  // UPDATE TRAINING BATCH STATUS
  // =========================================================

  const updateBatchStatus = useCallback(
    async (
      id: string,
      status: UpdateTrainingBatchStatusRequest,
    ): Promise<boolean> => {
      try {
        setIsUpdatingStatus(true);
        setError(null);

        await trainingBatchApi.updateStatus(
          id,
          status,
        );

        await loadBatches();

        if (selectedBatch?.id === id) {
          await getBatch(id);
        }

        return true;
      } catch (error) {
        console.error(
          "UPDATE TRAINING BATCH STATUS ERROR:",
          error,
        );

        setError(
          error instanceof Error
            ? error.message
            : "Unable to update training batch status.",
        );

        return false;
      } finally {
        setIsUpdatingStatus(false);
      }
    },
    [
      trainingBatchApi,
      loadBatches,
      getBatch,
      selectedBatch?.id,
    ],
  );

  // =========================================================
  // REFRESH TRAINING BATCHES
  // =========================================================

  const refresh = useCallback(
    async (): Promise<void> => {
      await loadBatches();
    },
    [loadBatches],
  );

  // =========================================================
  // DELETE TRAINING BATCH
  // =========================================================

  const deleteBatch = useCallback(
    async (
      id: string,
    ): Promise<boolean> => {
      try {
        setIsDeleting(true);
        setError(null);

        await trainingBatchApi.delete(id);

        setBatches((current) =>
          current.filter(
            (batch) => batch.id !== id,
          ),
        );

        if (selectedBatch?.id === id) {
          setSelectedBatch(null);
          setScheduleRecommendation(null);
          setTrainingSessions([]);
          setScheduleError(null);
        }

        return true;
      } catch (error) {
        console.error(
          "DELETE TRAINING BATCH ERROR:",
          error,
        );

        setError(
          error instanceof Error
            ? error.message
            : "Unable to delete training batch.",
        );

        return false;
      } finally {
        setIsDeleting(false);
      }
    },
    [
      trainingBatchApi,
      selectedBatch?.id,
    ],
  );

  // =========================================================
  // GET SCHEDULE RECOMMENDATION
  // GET /api/training-batches/{id}/schedule/recommendation
  // =========================================================

  const getScheduleRecommendation = useCallback(
    async (
      trainingBatchId: string,
    ): Promise<TrainingScheduleRecommendation | null> => {
      try {
        setIsLoadingSchedule(true);
        setScheduleError(null);

        const result =
          await trainingBatchApi.getScheduleRecommendation(
            trainingBatchId,
          );

        setScheduleRecommendation(result);

        return result;
      } catch (error) {
        console.error(
          "GET TRAINING SCHEDULE RECOMMENDATION ERROR:",
          error,
        );

        setScheduleError(
          error instanceof Error
            ? error.message
            : "Unable to load training schedule recommendation.",
        );

        setScheduleRecommendation(null);

        return null;
      } finally {
        setIsLoadingSchedule(false);
      }
    },
    [trainingBatchApi],
  );

  // =========================================================
  // GENERATE AUTOMATIC SCHEDULE PREVIEW
  // POST /api/training-batches/{id}/schedule/generate
  //
  // Preview only. Backend does not save generated sessions.
  // =========================================================

  const generateSchedule = useCallback(
    async (
      trainingBatchId: string,
      request: GenerateTrainingScheduleRequest,
    ): Promise<TrainingSession[] | null> => {
      try {
        setIsGeneratingSchedule(true);
        setScheduleError(null);

        const result =
          await trainingBatchApi.generateSchedule(
            trainingBatchId,
            request,
          );

        const sessions = Array.isArray(result)
          ? result
          : [];

        setTrainingSessions(sessions);

        return sessions;
      } catch (error) {
        console.error(
          "GENERATE TRAINING SCHEDULE ERROR:",
          error,
        );

        setScheduleError(
          error instanceof Error
            ? error.message
            : "Unable to generate training schedule.",
        );

        setTrainingSessions([]);

        return null;
      } finally {
        setIsGeneratingSchedule(false);
      }
    },
    [trainingBatchApi],
  );

  // =========================================================
  // CREATE MANUAL TRAINING SCHEDULE
  // POST /api/training-batches/{id}/schedule/manual/preview
  //
  // IMPORTANT:
  // Despite the endpoint name, the backend saves sessions.
  // Admin only.
  // =========================================================

  const createManualSchedule = useCallback(
    async (
      trainingBatchId: string,
      request: CreateManualTrainingScheduleRequest,
    ): Promise<TrainingSession[] | null> => {
      try {
        setIsCreatingManualSchedule(true);
        setScheduleError(null);

        const result =
          await trainingBatchApi.createManualSchedule(
            trainingBatchId,
            request,
          );

        const sessions = Array.isArray(result)
          ? result
          : [];

        setTrainingSessions(sessions);

        // The manual schedule has been saved.
        // Reload the batch's current recommendation if needed
        // separately; do not replace the saved sessions with
        // generated preview sessions.

        return sessions;
      } catch (error) {
        console.error(
          "CREATE MANUAL TRAINING SCHEDULE ERROR:",
          error,
        );

        setScheduleError(
          error instanceof Error
            ? error.message
            : "Unable to create manual training schedule.",
        );

        return null;
      } finally {
        setIsCreatingManualSchedule(false);
      }
    },
    [trainingBatchApi],
  );

  // =========================================================
  // GET SAVED TRAINING SCHEDULE
  // GET /api/training-batches/{id}/schedule
  // =========================================================

  const getSchedule = useCallback(
    async (
      trainingBatchId: string,
    ): Promise<TrainingSession[] | null> => {
      try {
        setIsLoadingSchedule(true);
        setScheduleError(null);

        const result =
          await trainingBatchApi.getSchedule(
            trainingBatchId,
          );

        const sessions = Array.isArray(result)
          ? result
          : [];

        setTrainingSessions(sessions);

        return sessions;
      } catch (error) {
        console.error(
          "GET TRAINING SCHEDULE ERROR:",
          error,
        );

        setTrainingSessions([]);

        setScheduleError(
          error instanceof Error
            ? error.message
            : "Unable to load training schedule.",
        );

        return null;
      } finally {
        setIsLoadingSchedule(false);
      }
    },
    [trainingBatchApi],
  );

  // =========================================================
  // GET PARTICIPANT TRAINING SCHEDULE
  // GET /api/training-batches/{id}/schedule/participant
  // =========================================================

  const getParticipantSchedule = useCallback(
    async (
      trainingBatchId: string,
    ): Promise<TrainingSession[] | null> => {
      try {
        setIsLoadingSchedule(true);
        setScheduleError(null);

        const result =
          await trainingBatchApi.getParticipantSchedule(
            trainingBatchId,
          );

        const sessions = Array.isArray(result)
          ? result
          : [];

        setTrainingSessions(sessions);

        return sessions;
      } catch (error) {
        console.error(
          "GET PARTICIPANT TRAINING SCHEDULE ERROR:",
          error,
        );

        setScheduleError(
          error instanceof Error
            ? error.message
            : "Unable to load participant training schedule.",
        );

        setTrainingSessions([]);

        return null;
      } finally {
        setIsLoadingSchedule(false);
      }
    },
    [trainingBatchApi],
  );

  // =========================================================
  // APPROVE TRAINING SCHEDULE
  // POST /api/training-batches/{id}/schedule/approve
  // =========================================================

  const approveSchedule = useCallback(
    async (
      trainingBatchId: string,
      sessions: TrainingSession[],
    ): Promise<boolean> => {
      try {
        setIsApprovingSchedule(true);
        setScheduleError(null);

        await trainingBatchApi.approveSchedule(
          trainingBatchId,
          sessions,
        );

        // Approval recreates the database sessions.
        // Reload to obtain their actual persisted IDs.
        const approvedSessions =
          await getSchedule(trainingBatchId);

        if (approvedSessions === null) {
          setScheduleError(
            "The schedule was approved, but the saved schedule could not be reloaded. Refresh the schedule before continuing.",
          );
        }

        // The approval API call succeeded even if reloading
        // the saved sessions failed.
        return true;
      } catch (error) {
        console.error(
          "APPROVE TRAINING SCHEDULE ERROR:",
          error,
        );

        setScheduleError(
          error instanceof Error
            ? error.message
            : "Failed to approve training schedule.",
        );

        return false;
      } finally {
        setIsApprovingSchedule(false);
      }
    },
    [
      trainingBatchApi,
      getSchedule,
    ],
  );

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    void loadBatches();
  }, [loadBatches]);

  // =========================================================
  // RESET
  // =========================================================

  const reset = useCallback(() => {
    setBatches([]);
    setSelectedBatch(null);
    setScheduleRecommendation(null);
    setTrainingSessions([]);

    setIsLoading(false);
    setIsCreating(false);
    setIsUpdating(false);
    setIsUpdatingStatus(false);
    setIsDeleting(false);
    setIsLoadingSchedule(false);
    setIsGeneratingSchedule(false);
    setIsCreatingManualSchedule(false);
    setIsApprovingSchedule(false);

    setError(null);
    setScheduleError(null);
  }, []);

  // =========================================================
  // RETURN
  // =========================================================

  return {
    // DATA
    batches,
    selectedBatch,
    scheduleRecommendation,
    trainingSessions,

    // SETTERS
    setSelectedBatch,

    // LOADING
    isLoading,
    isCreating,
    isUpdating,
    isUpdatingStatus,
    isDeleting,
    isLoadingSchedule,
    isGeneratingSchedule,
    isCreatingManualSchedule,
    isApprovingSchedule,

    // ERRORS
    error,
    scheduleError,

    // TRAINING BATCH ACTIONS
    loadBatches,
    getBatch,
    createBatch,
    updateBatch,
    updateBatchStatus,
    deleteBatch,
    refresh,

    // TRAINING SCHEDULE ACTIONS
    getScheduleRecommendation,
    generateSchedule,
    createManualSchedule,
    getSchedule,
    getParticipantSchedule,
    approveSchedule,

    // RESET
    reset,
  };
}
