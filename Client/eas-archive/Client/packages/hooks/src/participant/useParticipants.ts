import { useEffect, useMemo, useState } from "react";
import type { Participant } from "@repo/types";
import type { ParticipantApi } from "@repo/api";

export function createUseParticipants(
  participantApi: ParticipantApi
) {
  return function useParticipants() {
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const fetchParticipants = async () => {
      try {
        setLoading(true);
        const data = await participantApi.getAll();
        setParticipants(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      fetchParticipants();
    }, []);
 const count = useMemo(() => participants.length, [participants]);
    return {
      participants,
      loading,
      count,
      error,
      refresh: fetchParticipants,
    };
  };
}