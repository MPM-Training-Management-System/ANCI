import { useCallback, useState } from "react";

import type {
  Certificate,
  EligibleCertificate,
} from "@repo/types";

import {
  ApiClient,
  CertificateApi,
} from "@repo/api";

export function useCertificates(api: ApiClient) {
  const certificateApi = new CertificateApi(api);

  const [certificates, setCertificates] =
    useState<Certificate[]>([]);

  const [enrollmentCertificates, setEnrollmentCertificates] =
    useState<Certificate[]>([]);

  const [eligibleParticipants, setEligibleParticipants] =
    useState<EligibleCertificate[]>([]);

  const [isLoading, setIsLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  // =========================================================
  // CLEAR ERROR
  // =========================================================

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // =========================================================
  // LOAD ALL CERTIFICATES
  // =========================================================

  const loadCertificates = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data =
        await certificateApi.getAll();

      setCertificates(data);

      return data;
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to load certificates.";

      setError(message);
      setCertificates([]);

      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [api]);

  // =========================================================
  // LOAD CERTIFICATES BY ENROLLMENT
  // =========================================================

  const loadEnrollmentCertificates =
    useCallback(
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
      [api]
    );

  // =========================================================
  // LOAD ELIGIBLE PARTICIPANTS
  // =========================================================

  const loadEligibleParticipants =
    useCallback(async () => {
      setIsLoading(true);
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
        setEligibleParticipants([]);

        throw err;
      } finally {
        setIsLoading(false);
      }
    }, [api]);

  // =========================================================
  // GENERATE CERTIFICATES
  // =========================================================

  const generateCertificates =
    useCallback(
      async (enrollmentId: string) => {
        setIsLoading(true);
        setError(null);

        try {
          /*
           * Backend handles:
           *
           * Enrollment
           *      ↓
           * TrainingBatch
           *      ↓
           * TrainingProgram
           *      ↓
           * TrainingGrade
           *      ↓
           * Canva Autofill
           *      ↓
           * PDF
           *      ↓
           * Certificate records
           */

          const data =
            await certificateApi.generate(
              enrollmentId
            );

          // Update certificates for this enrollment
          setEnrollmentCertificates(data);

          /*
           * Refresh the admin certificate list
           * so the UI immediately shows the
           * newly generated certificates.
           */
          const [allCertificates, eligible] =
            await Promise.all([
              certificateApi.getAll(),
              certificateApi.getEligible(),
            ]);

          setCertificates(
            allCertificates
          );

          setEligibleParticipants(
            eligible
          );

          return data;
        } catch (err) {
          const message =
            err instanceof Error
              ? err.message
              : "Failed to generate certificates.";

          setError(message);

          throw err;
        } finally {
          setIsLoading(false);
        }
      },
      [api]
    );

  // =========================================================
  // VERIFY CERTIFICATE
  // =========================================================

  const verifyCertificate =
    useCallback(
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
      [api]
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
  }, []);

  // =========================================================
  // RETURN
  // =========================================================

  return {
    certificates,
    enrollmentCertificates,
    eligibleParticipants,

    isLoading,
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