
import {
  useCallback,
  useMemo,
  useState,
} from "react";

import type {
  Certificate,
  EligibleCertificate,
} from "@repo/types";

import {
  ApiClient,
  CertificateApi,
} from "@repo/api";

export function useCertificates(api: ApiClient) {
  const certificateApi = useMemo(
    () => new CertificateApi(api),
    [api]
  );

  const [certificates, setCertificates] =
    useState<Certificate[]>([]);

  const [
    enrollmentCertificates,
    setEnrollmentCertificates,
  ] = useState<Certificate[]>([]);

  const [eligibleParticipants, setEligibleParticipants] =
    useState<EligibleCertificate[]>([]);

  // Initial page/table loading only.
  const [isLoading, setIsLoading] =
    useState(false);

  // Background refresh has its own loading state.
  const [isRefreshing, setIsRefreshing] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // =========================================================
  // LOAD ALL CERTIFICATES
  // =========================================================

  const loadCertificates = useCallback(
    async (options?: { background?: boolean }) => {
      const background = options?.background ?? false;

      if (background) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      setError(null);

      try {
        const data = await certificateApi.getAll();

        setCertificates(data);

        return data;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to load certificates.";

        setError(message);

        // Preserve existing rows during background refresh.
        if (!background) {
          setCertificates([]);
        }

        throw err;
      } finally {
        if (background) {
          setIsRefreshing(false);
        } else {
          setIsLoading(false);
        }
      }
    },
    [certificateApi]
  );

  // =========================================================
  // LOAD CERTIFICATES BY ENROLLMENT
  // =========================================================

  const loadEnrollmentCertificates = useCallback(
    async (enrollmentId: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const data =
          await certificateApi.getByEnrollment(
            enrollmentId
          );

        setEnrollmentCertificates(data);

        return data;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to load certificates.";

        setError(message);
        setEnrollmentCertificates([]);

        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [certificateApi]
  );

  // =========================================================
  // LOAD ELIGIBLE PARTICIPANTS
  // =========================================================

  const loadEligibleParticipants = useCallback(
    async (options?: { background?: boolean }) => {
      const background = options?.background ?? false;

      if (background) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      setError(null);

      try {
        const data =
          await certificateApi.getEligible();

        setEligibleParticipants(data);

        return data;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to load eligible participants.";

        setError(message);

        // Preserve existing rows during background refresh.
        if (!background) {
          setEligibleParticipants([]);
        }

        throw err;
      } finally {
        if (background) {
          setIsRefreshing(false);
        } else {
          setIsLoading(false);
        }
      }
    },
    [certificateApi]
  );

  // =========================================================
  // GENERATE CERTIFICATES
  // =========================================================

  const generateCertificates = useCallback(
    async (enrollmentId: string) => {
      setError(null);

      try {
        const data =
          await certificateApi.generate(enrollmentId);

        setEnrollmentCertificates(data);

        // Return the generated data.
        // The page will refresh the two lists once.
        return data;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to generate certificates.";

        setError(message);

        throw err;
      }
    },
    [certificateApi]
  );

  // =========================================================
  // VERIFY CERTIFICATE
  // =========================================================

  const verifyCertificate = useCallback(
    async (verificationCode: string) => {
      setIsLoading(true);
      setError(null);

      try {
        return await certificateApi.verify(
          verificationCode
        );
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to verify certificate.";

        setError(message);

        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [certificateApi]
  );

  // =========================================================
  // RESET
  // =========================================================

  const reset = useCallback(() => {
    setCertificates([]);
    setEnrollmentCertificates([]);
    setEligibleParticipants([]);
    setError(null);
    setIsLoading(false);
    setIsRefreshing(false);
  }, []);

  return {
    certificates,
    enrollmentCertificates,
    eligibleParticipants,

    isLoading,
    isRefreshing,
    error,

    clearError,
    reset,

    loadCertificates,
    loadEligibleParticipants,
    loadEnrollmentCertificates,

    generateCertificates,
    verifyCertificate,
  };
}
