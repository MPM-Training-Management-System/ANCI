import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import type { Participant } from "@repo/types";

export function createUseParticipants(api: {
  getAll: () => Promise<Participant[]>;
}) {
  return function useParticipants() {
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [loading, setLoading] = useState(true);

    const loadParticipants = useCallback(async () => {
      try {
        setLoading(true);

        const data = await api.getAll();

        setParticipants(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }, []);

    useEffect(() => {
      loadParticipants();
    }, [loadParticipants]);

    const count = useMemo(() => {
      return participants.length;
    }, [participants]);

    return {
      participants,
      loading,
      count,
      refresh: loadParticipants,
    };
  };
}