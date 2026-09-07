import { useCallback, useEffect, useState } from "react";
import type { AdminProfile } from "@repo/types";
import type { AdminApi } from "@repo/api";

export function useAdminMe(adminApi: AdminApi) {
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const fetchProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("================================");
      console.log("GET ADMIN PROFILE");
      console.log("================================");

      const data = await adminApi.getMe();

      console.log("PROFILE DATA:", data);

      setProfile(data);
    } catch (err) {
      console.error("================================");
      console.error("GET ADMIN PROFILE ERROR");
      console.error("================================");
      console.error(err);

      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [adminApi]);

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