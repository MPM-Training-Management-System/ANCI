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
      } catch (error) {
        console.error(
          "GET TRAINER PROFILE ERROR:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load trainer profile."
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
        } catch (error) {
          console.error(
            "UPDATE TRAINER PROFILE ERROR:",
            error
          );

          setUpdateError(
            error instanceof Error
              ? error.message
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