import {
  useCallback,
  useEffect,
  useState,
} from "react";

import type { ParticipantProfile } from "@repo/types";
import type { ParticipantApi } from "@repo/api";

export function useParticipantProfile(
  participantApi: ParticipantApi
) {
  const [profile, setProfile] =
    useState<ParticipantProfile | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState<unknown>(null);

  const fetchProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data =
        await participantApi.getAll();

      setProfile(data);
    } catch (err) {
      console.error(
        "GET PARTICIPANT PROFILE ERROR:",
        err
      );

      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [participantApi]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    isLoading,
    error,
    refetch: fetchProfile,
  };
}