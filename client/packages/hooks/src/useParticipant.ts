import {
  useCallback,
  useEffect,
  useState,
} from "react";

import type {
  ParticipantProfile,
  UpdateParticipantProfile,
} from "@repo/types";

import type {
  ParticipantProfileApi,
} from "@repo/api";

// =========================================================
// PARTICIPANT PROFILE HOOK
//
// Used by:
// - Participant Mobile
//
// Handles:
// - Loading current participant profile
// - Updating participant profile
// - Updating participant profile image
// =========================================================

export function useParticipant(
  api: ParticipantProfileApi
) {

  // =======================================================
  // STATE
  // =======================================================

  const [profile, setProfile] =
    useState<ParticipantProfile | null>(null);

  const [isLoading, setIsLoading] =
    useState(false);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [error, setError] =
    useState<Error | null>(null);


  // =======================================================
  // GET MY PROFILE
  //
  // Participant:
  // GET /api/participant-profiles/me
  // =======================================================

  const loadMyProfile =
    useCallback(async () => {

      try {

        setIsLoading(true);
        setError(null);

        const result =
          await api.getMyProfile();

        setProfile(result);

        return result;

      } catch (err) {

        const normalizedError =
          err instanceof Error
            ? err
            : new Error(
                "Failed to load participant profile."
              );

        setError(normalizedError);

        throw normalizedError;

      } finally {

        setIsLoading(false);

      }

    }, [api]);


  // =======================================================
  // UPDATE MY PROFILE
  //
  // Participant:
  // PUT /api/participant-profiles/me
  // =======================================================

  const updateMyProfile =
    useCallback(
      async (
        request: UpdateParticipantProfile
      ) => {

        try {

          setIsSubmitting(true);
          setError(null);

          const result =
            await api.updateMyProfile(
              request
            );

          setProfile(
            result.profile
          );

          return result;

        } catch (err) {

          const normalizedError =
            err instanceof Error
              ? err
              : new Error(
                  "Failed to update participant profile."
                );

          setError(normalizedError);

          throw normalizedError;

        } finally {

          setIsSubmitting(false);

        }

      },
      [api]
    );


  // =======================================================
  // UPDATE PROFILE IMAGE
  //
  // Participant:
  // PUT /api/participant-profiles/me/image
  // =======================================================
const updateProfileImage =
  useCallback(
    async (
      profileImage: {
        uri: string;
        name: string;
        type: string;
      }
    ) => {
      try {
        setIsSubmitting(true);
        setError(null);

        const result =
          await api.updateProfileImage(
            profileImage
          );

        setProfile(result.profile);

        return result;
      } catch (err) {
        const normalizedError =
          err instanceof Error
            ? err
            : new Error(
                "Failed to update profile image."
              );

        setError(normalizedError);

        throw normalizedError;
      } finally {
        setIsSubmitting(false);
      }
    },
    [api]
  );


  // =======================================================
  // REFRESH PROFILE
  // =======================================================

  const refreshProfile =
    useCallback(async () => {

      return loadMyProfile();

    }, [loadMyProfile]);


  // =======================================================
  // RESET
  // =======================================================

  const reset =
    useCallback(() => {

      setProfile(null);

      setError(null);

      setIsLoading(false);

      setIsSubmitting(false);

    }, []);


  // =======================================================
  // INITIAL LOAD
  // =======================================================

  useEffect(() => {

    loadMyProfile()
      .catch(() => {
        // Error is already stored
        // inside the hook state.
      });

  }, [loadMyProfile]);


  // =======================================================
  // RETURN
  // =======================================================

  return {

    // -------------------------------------------------------
    // Profile
    // -------------------------------------------------------

    profile,

    loadMyProfile,

    refreshProfile,


    // -------------------------------------------------------
    // Update
    // -------------------------------------------------------

    updateMyProfile,

    updateProfileImage,


    // -------------------------------------------------------
    // State
    // -------------------------------------------------------

    isLoading,

    isSubmitting,

    error,


    // -------------------------------------------------------
    // Reset
    // -------------------------------------------------------

    reset,
  };
}