"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import type {
  TrainerProfile,
  UpdateTrainerProfileRequest,
} from "@repo/types";

import type {
  TrainerApi,
} from "@repo/api";

export function useTrainerMe(
  trainerApi: TrainerApi
) {
  // =========================================================
  // STATE
  // =========================================================

  const [profile, setProfile] =
    useState<TrainerProfile | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [isUpdating, setIsUpdating] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [updateError, setUpdateError] =
    useState<string | null>(null);

  const [updateSuccess, setUpdateSuccess] =
    useState(false);

  // =========================================================
  // GET MY PROFILE
  // =========================================================

  const fetchProfile =
    useCallback(async () => {
      try {
        setIsLoading(true);
        setError(null);

        const data =
          await trainerApi.getMyProfile();

        setProfile(data);

        return data;
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : typeof err === "string"
            ? err
            : "";

        const status =
          (err as { status?: number; statusCode?: number })?.status ||
          (err as { status?: number; statusCode?: number })?.statusCode;

        /*
         * A TrainerApplication can exist before a TrainerProfile is created.
         *
         * Therefore, a 404 from /trainer-profiles/me is expected while the
         * application is still pending / under review.
         */
        const isProfileNotFound =
          status === 404 ||
          errorMessage.toLowerCase().includes("trainer profile not found") ||
          errorMessage.toLowerCase().includes("profile not found") ||
          errorMessage.includes("404");

        if (isProfileNotFound) {
          // Expected state for pending application / non-trainer user.
          setProfile(null);
          setError(null);
          return null;
        }

        // Log only unexpected failures
        console.error("GET TRAINER PROFILE ERROR:", err);

        setError(
          errorMessage || "Unable to load trainer profile."
        );

        setProfile(null);

        return null;
      } finally {
        setIsLoading(false);
      }
    }, [trainerApi]);

  // =========================================================
  // UPDATE MY PROFILE
  // =========================================================

  const updateProfile =
    useCallback(
      async (
        request: UpdateTrainerProfileRequest
      ) => {
        try {
          setIsUpdating(true);
          setUpdateError(null);
          setUpdateSuccess(false);

          const updatedProfile =
            await trainerApi.updateMyProfile(
              request
            );

          setProfile(updatedProfile);

          setUpdateSuccess(true);

          return updatedProfile;
        } catch (err: unknown) {
          console.error(
            "UPDATE TRAINER PROFILE ERROR:",
            err
          );

          setUpdateError(
            err instanceof Error
              ? err.message
              : "Unable to update trainer profile."
          );

          return null;
        } finally {
          setIsUpdating(false);
        }
      },
      [trainerApi]
    );

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // =========================================================
  // RESET UPDATE STATE
  // =========================================================

  const resetUpdateState =
    useCallback(() => {
      setUpdateError(null);
      setUpdateSuccess(false);
    }, []);

  // =========================================================
  // RESET
  // =========================================================

  const reset =
    useCallback(() => {
      setProfile(null);
      setIsLoading(false);
      setIsUpdating(false);
      setError(null);
      setUpdateError(null);
      setUpdateSuccess(false);
    }, []);

  // =========================================================
  // RETURN
  // =========================================================

  return {
    // Profile
    profile,

    // Loading
    isLoading,
    isUpdating,

    // Errors
    error,
    updateError,

    // Success
    updateSuccess,

    // Actions
    fetchProfile,
    refetch: fetchProfile,
    updateProfile,
    resetUpdateState,
    reset,
  };
}