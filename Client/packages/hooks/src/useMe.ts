import { useCallback, useEffect, useState } from "react";
import type { ParticipantProfile } from "@repo/types";
import type { ParticipantApi } from "@repo/api";

export function useMe(participantApi: ParticipantApi) {
  const [profile, setProfile] = useState<ParticipantProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const fetchProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("================================");
      console.log("GET PARTICIPANT PROFILE");
      console.log("================================");

      const data = await participantApi.getMe();

      console.log("PROFILE DATA:", data);

      setProfile(data);
    } catch (err) {
      console.error("================================");
      console.error("GET PARTICIPANT PROFILE ERROR");
      console.error("================================");
      console.error(err);

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