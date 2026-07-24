"use client"


import { useEffect, useState } from "react";
import { participantApi } from "@repo/api";
import type { Participant } from "@repo/types";

export function useParticipants() {
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

  return {
    participants,
    loading,
    error,
    refresh: fetchParticipants,
  };
}