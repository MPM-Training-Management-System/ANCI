"use client";

import { useEffect, useState } from "react";
import { trainingApi } from "@/lib/api";
import type { Training } from "@repo/types";

export function useTraining() {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrainings = async () => {
    try {
      setLoading(true);

      const data = await trainingApi.getAll();

      setTrainings(data);
      setError(null);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load trainings."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainings();
  }, []);

  return {
    trainings,
    loading,
    error,
    refetch: fetchTrainings,
  };
}