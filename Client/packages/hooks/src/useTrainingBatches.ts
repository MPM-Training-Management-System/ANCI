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

  const [
    batches,
    setBatches,
  ] = useState<TrainingBatch[]>([]);

  const [
    selectedBatch,
    setSelectedBatch,
  ] = useState<TrainingBatch | null>(null);

  // =========================================================
  // TRAINING SCHEDULE DATA
  // =========================================================

  const [
    scheduleRecommendation,
    setScheduleRecommendation,
  ] = useState<TrainingScheduleRecommendation | null>(null);

  const [
    trainingSessions,
    setTrainingSessions,
  ] = useState<TrainingSession[]>([]);

  // =========================================================
  // LOADING
  // =========================================================

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
    isUpdatingStatus,
    setIsUpdatingStatus,
  ] = useState(false);

  const [
    isDeleting,
    setIsDeleting,
  ] = useState(false);

  // =========================================================
  // TRAINING SCHEDULE LOADING
  // =========================================================

  const [
    isLoadingSchedule,
    setIsLoadingSchedule,
  ] = useState(false);

  const [
    isGeneratingSchedule,
    setIsGeneratingSchedule,
  ] = useState(false);

  // =========================================================
  // ERROR
  // =========================================================

  const [
    error,
    setError,
  ] = useState<string | null>(null);

  const [
    scheduleError,
    setScheduleError,
  ] = useState<string | null>(null);

  // =========================================================
  // GET ALL
  // =========================================================

  const loadBatches = useCallback(
    async () => {
      try {
        setIsLoading(true);
        setError(null);

        const result =
          await trainingBatchApi.getAll();

        setBatches(
          Array.isArray(result)
            ? result
            : [],
        );
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
      } finally {
        setIsLoading(false);
      }
    },
    [
      trainingBatchApi,
    ],
  );

  // =========================================================
  // GET BY ID
  // =========================================================

  const getBatch = useCallback(
    async (
      id: string,
    ) => {
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
    [
      trainingBatchApi,
    ],
  );

  // =========================================================
  // CREATE
  // =========================================================

  const createBatch = useCallback(
    async (
      request: CreateTrainingBatchRequest,
    ) => {
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
    [
      trainingBatchApi,
      loadBatches,
    ],
  );

  // =========================================================
  // UPDATE
  // =========================================================

  const updateBatch = useCallback(
    async (
      id: string,
      request: UpdateTrainingBatchRequest,
    ) => {
      try {
        setIsUpdating(true);
        setError(null);

        await trainingBatchApi.update(
          id,
          request,
        );

        await loadBatches();

        if (
          selectedBatch?.id === id
        ) {
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
  // UPDATE STATUS
  // =========================================================

  const updateBatchStatus =
    useCallback(
      async (
        id: string,
        status: UpdateTrainingBatchStatusRequest,
      ) => {
        try {
          setIsUpdatingStatus(true);
          setError(null);

          await trainingBatchApi.updateStatus(
            id,
            status,
          );

          await loadBatches();

          if (
            selectedBatch?.id === id
          ) {
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
  // REFRESH
  // =========================================================

  const refresh = useCallback(
    async () => {
      await loadBatches();
    },
    [
      loadBatches,
    ],
  );

  // =========================================================
  // DELETE
  // =========================================================

  const deleteBatch = useCallback(
    async (
      id: string,
    ) => {
      try {
        setIsDeleting(true);
        setError(null);

        await trainingBatchApi.delete(id);

        // -----------------------------------------------------
        // Remove immediately from UI
        // -----------------------------------------------------

        setBatches(
          current =>
            current.filter(
              batch =>
                batch.id !== id,
            ),
        );

        // -----------------------------------------------------
        // Clear selected batch if deleted
        // -----------------------------------------------------

        if (
          selectedBatch?.id === id
        ) {
          setSelectedBatch(null);
          setScheduleRecommendation(null);
          setTrainingSessions([]);
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
  //
  // GET
  // /api/training-batches/{trainingBatchId}/schedule/recommendation
  // =========================================================

  const getScheduleRecommendation =
    useCallback(
      async (
        trainingBatchId: string,
      ) => {
        try {
          setIsLoadingSchedule(true);
          setScheduleError(null);

          // IMPORTANT:
          // Use the injected TrainingBatchApi instance.
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
      [
        trainingBatchApi,
      ],
    );

  // =========================================================
  // GENERATE TRAINING SCHEDULE
  //
  // POST
  // /api/training-batches/{trainingBatchId}/schedule/generate
  // =========================================================

  const generateSchedule =
    useCallback(
      async (
        trainingBatchId: string,
        request: GenerateTrainingScheduleRequest,
      ) => {
        try {
          setIsGeneratingSchedule(true);
          setScheduleError(null);

          // IMPORTANT:
          // Use TrainingBatchApi.generateSchedule()
          const result =
            await trainingBatchApi.generateSchedule(
              trainingBatchId,
              request,
            );

          setTrainingSessions(
            Array.isArray(result)
              ? result
              : [],
          );

          // ---------------------------------------------------
          // Refresh recommendation
          // ---------------------------------------------------

          await getScheduleRecommendation(
            trainingBatchId,
          );

          return result;
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
      [
        trainingBatchApi,
        getScheduleRecommendation,
      ],
    );

  // =========================================================
  // GET TRAINING SCHEDULE
  //
  // GET
  // /api/training-batches/{trainingBatchId}/schedule
  // =========================================================
const getSchedule = useCallback(
  async (trainingBatchId: string) => {
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
     const message =
  error instanceof Error
    ? error.message
    : "";

if (
  message.includes("404") ||
  message.toLowerCase().includes("not found")
) {
  setTrainingSessions([]);
  setScheduleError(null);

  return [];
}

console.error(
  "GET TRAINING SCHEDULE ERROR:",
  error,
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
  //
  // POST
  // /api/training-batches/{trainingBatchId}/schedule/approve
  // =========================================================

  const approveSchedule = useCallback(
  async (
    trainingBatchId: string,
    sessions: TrainingSession[],
  ): Promise<boolean> => {
    try {
      setScheduleError(null);

      await trainingBatchApi.approveSchedule(
        trainingBatchId,
        sessions,
      );

      // Schedule is now officially approved
      setTrainingSessions(sessions);

      return true;
    } catch (error) {
      console.error(
        "APPROVE TRAINING SCHEDULE ERROR:",
        error,
      );

      const message =
        error instanceof Error
          ? error.message
          : "Failed to approve training schedule.";

      setScheduleError(message);

      return false;
    }
  },
  [trainingBatchApi],
);
  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    loadBatches();
  }, [
    loadBatches,
  ]);

  // =========================================================
  // RESET
  // =========================================================

  const reset = useCallback(
    () => {
      // -------------------------------------------------------
      // Data
      // -------------------------------------------------------

      setBatches([]);
      setSelectedBatch(null);
      setScheduleRecommendation(null);
      setTrainingSessions([]);

      // -------------------------------------------------------
      // Loading
      // -------------------------------------------------------

      setIsLoading(false);
      setIsCreating(false);
      setIsUpdating(false);
      setIsUpdatingStatus(false);
      setIsDeleting(false);
      setIsLoadingSchedule(false);
      setIsGeneratingSchedule(false);

      // -------------------------------------------------------
      // Error
      // -------------------------------------------------------

      setError(null);
      setScheduleError(null);
    },
    [],
  );

  // =========================================================
  // RETURN
  // =========================================================

  return {
    // -------------------------------------------------------
    // DATA
    // -------------------------------------------------------

    batches,

    selectedBatch,

    scheduleRecommendation,

    trainingSessions,

    // -------------------------------------------------------
    // SETTER
    // -------------------------------------------------------

    setSelectedBatch,

    // -------------------------------------------------------
    // LOADING
    // -------------------------------------------------------

    isLoading,

    isCreating,

    isUpdating,

    isUpdatingStatus,

    isDeleting,

    isLoadingSchedule,

    isGeneratingSchedule,

    // -------------------------------------------------------
    // ERROR
    // -------------------------------------------------------

    error,

    scheduleError,

    // -------------------------------------------------------
    // ACTIONS
    // -------------------------------------------------------

    loadBatches,

    getBatch,

    createBatch,

    updateBatch,

    updateBatchStatus,

    deleteBatch,

    refresh,

    // Schedule
    getScheduleRecommendation,

    generateSchedule,

    getSchedule,

    approveSchedule,

    // -------------------------------------------------------
    // RESET
    // -------------------------------------------------------

    reset,
  };
}