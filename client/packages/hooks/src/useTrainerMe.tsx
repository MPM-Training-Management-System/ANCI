    import {
    useCallback,
    useEffect,
    useState,
    } from "react";

    import type { TrainerProfile } from "@repo/types";
    import type { TrainerApi } from "@repo/api";

    export function useTrainerMe(
    trainerApi: TrainerApi
    ) {
    const [profile, setProfile] =
        useState<TrainerProfile | null>(null);

    const [isLoading, setIsLoading] =
        useState(true);

    const [error, setError] =
        useState<unknown>(null);

    const fetchProfile = useCallback(async () => {
        try {
        setIsLoading(true);
        setError(null);

        const data =
            await trainerApi.getMyApplication();

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
    }, [trainerApi]);

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