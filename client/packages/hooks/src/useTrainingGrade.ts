import { useCallback, useState } from "react";
import type { TrainingGrade } from "@repo/types";
import { ApiClient, TrainingGradeApi } from "@repo/api";

export function useTrainingGrade(api: ApiClient) {
  const trainingGradeApi = new TrainingGradeApi(api);

  const [grades, setGrades] = useState<TrainingGrade[]>([]);
  const [grade, setGrade] = useState<TrainingGrade | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const loadAllGrades = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await trainingGradeApi.getAll();

      setGrades(data);

      return data;
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to load training grades.";

      setError(message);
      setGrades([]);

      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [api]);

  const loadGrade = useCallback(
    async (enrollmentId: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const data =
          await trainingGradeApi.getByEnrollment(enrollmentId);

        setGrade(data);

        return data;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to load training grade.";

        setError(message);
        setGrade(null);

        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [api]
  );

  const reset = useCallback(() => {
    setGrades([]);
    setGrade(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    grades,
    grade,
    isLoading,
    error,

    clearError,
    reset,

    loadAllGrades,
    loadGrade,
  };
}