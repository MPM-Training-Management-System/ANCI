import {
  useCallback,
  useState,
} from "react";

import type {
  ParticipationSetting,
  ParticipationParticipant,
  ParticipationProgress,
  ParticipationRecord,
  SaveParticipationSettingRequest,
  RecordParticipationRequest,
} from "@repo/types";

import {
  ApiClient,
  ParticipationApi,
} from "@repo/api";

export function useParticipation(
  api: ApiClient,
) {
  const participationApi =
    new ParticipationApi(api);

  // =========================================================
  // STATE
  // =========================================================

  const [setting, setSetting] =
    useState<ParticipationSetting | null>(null);

  const [participants, setParticipants] =
    useState<ParticipationParticipant[]>([]);

  const [progress, setProgress] =
    useState<ParticipationProgress | null>(null);

  const [record, setRecord] =
    useState<ParticipationRecord | null>(null);

  const [isLoading, setIsLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);


  // =========================================================
  // COMMON
  // =========================================================

  const clearError = useCallback(() => {
    setError(null);
  }, []);


  // =========================================================
  // ADMIN - PARTICIPATION SETTING
  // =========================================================

  const loadSetting = useCallback(
    async (
      trainingBatchId: string,
    ) => {
      setIsLoading(true);
      setError(null);

      try {
        const data =
          await participationApi.getSetting(
            trainingBatchId,
          );

        setSetting(data);

        return data;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to load participation setting.";

        setError(message);

        setSetting(null);

        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [api],
  );


  const saveSetting = useCallback(
    async (
      trainingBatchId: string,
      request: SaveParticipationSettingRequest,
    ) => {
      setIsLoading(true);
      setError(null);

      try {
        const data =
          await participationApi.saveSetting(
            trainingBatchId,
            request,
          );

        setSetting(data);

        return data;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to save participation setting.";

        setError(message);

        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [api],
  );


  // =========================================================
  // TRAINER - SESSION PARTICIPANTS
  // =========================================================

  const loadSessionParticipants =
    useCallback(
      async (
        trainingSessionId: string,
      ) => {
        setIsLoading(true);
        setError(null);

        try {
          const data =
            await participationApi.getSessionParticipants(
              trainingSessionId,
            );

          const normalized =
            Array.isArray(data)
              ? data
              : [];

          setParticipants(normalized);

          return normalized;
        } catch (err) {
          const message =
            err instanceof Error
              ? err.message
              : "Failed to load participation participants.";

          setError(message);

          setParticipants([]);

          throw err;
        } finally {
          setIsLoading(false);
        }
      },
      [api],
    );


  // =========================================================
  // TRAINER - RECORD RECITATION
  // =========================================================

  const recordRecitation =
    useCallback(
      async (
        request: RecordParticipationRequest,
      ) => {
        setIsLoading(true);
        setError(null);

        try {
          const data =
            await participationApi.record(
              request,
            );

          setRecord(data);

          return data;
        } catch (err) {
          const message =
            err instanceof Error
              ? err.message
              : "Failed to record recitation.";

          setError(message);

          throw err;
        } finally {
          setIsLoading(false);
        }
      },
      [api],
    );


  // =========================================================
  // TRAINER - REMOVE RECITATION
  // =========================================================

  const removeRecitation =
    useCallback(
      async (
        id: string,
      ) => {
        setIsLoading(true);
        setError(null);

        try {
          await participationApi.remove(id);

          if (record?.id === id) {
            setRecord(null);
          }

          setParticipants(current =>
            current.map(participant =>
              participant.participationRecordId === id
                ? {
                    ...participant,
                    hasRecited: false,
                    participationRecordId: null,
                    actualRecitations:
                      Math.max(
                        participant.actualRecitations - 1,
                        0,
                      ),
                  }
                : participant,
            ),
          );
        } catch (err) {
          const message =
            err instanceof Error
              ? err.message
              : "Failed to remove recitation.";

          setError(message);

          throw err;
        } finally {
          setIsLoading(false);
        }
      },
      [api, record?.id],
    );


  // =========================================================
  // PARTICIPANT - PROGRESS
  // =========================================================

  const loadProgress = useCallback(
    async (
      enrollmentId: string,
    ) => {
      setIsLoading(true);
      setError(null);

      try {
        const data =
          await participationApi.getProgress(
            enrollmentId,
          );

        setProgress(data);

        return data;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to load participation progress.";

        setError(message);

        setProgress(null);

        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [api],
  );


  // =========================================================
  // RESET
  // =========================================================

  const reset = useCallback(() => {
    setSetting(null);
    setParticipants([]);
    setProgress(null);
    setRecord(null);
    setError(null);
    setIsLoading(false);
  }, []);


  // =========================================================
  // RETURN
  // =========================================================

  return {
    // state
    setting,
    participants,
    progress,
    record,

    isLoading,
    error,

    // common
    clearError,
    reset,

    // admin
    loadSetting,
    saveSetting,

    // trainer
    loadSessionParticipants,
    recordRecitation,
    removeRecitation,

    // participant
    loadProgress,
  };
}