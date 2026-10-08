"use client";

import {
  useCallback,
  useState,
} from "react";

import type {
  AdminReportOverview,
  AssessmentResultsReport,
  AttendanceReport,
  CertificateReport,
  EnrollmentReport,
  ReportFilter,
  ServiceRequestReport,
  TrainerReport,
  TrainingCompletionReport,
} from "@repo/types";

import type {
  ReportApi,
} from "@repo/api";

export function useAdminReports(
  reportApi: ReportApi
) {
  // =========================================================
  // STATE
  // =========================================================

  const [
    overview,
    setOverview,
  ] = useState<AdminReportOverview | null>(null);

  const [
    trainingCompletion,
    setTrainingCompletion,
  ] = useState<TrainingCompletionReport | null>(null);

  const [
    enrollments,
    setEnrollments,
  ] = useState<EnrollmentReport | null>(null);

  const [
    attendance,
    setAttendance,
  ] = useState<AttendanceReport | null>(null);

  const [
    assessmentResults,
    setAssessmentResults,
  ] = useState<AssessmentResultsReport | null>(null);

  const [
    certificates,
    setCertificates,
  ] = useState<CertificateReport | null>(null);

  const [
    trainers,
    setTrainers,
  ] = useState<TrainerReport | null>(null);

  const [
    serviceRequests,
    setServiceRequests,
  ] = useState<ServiceRequestReport | null>(null);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(null);

  // =========================================================
  // OVERVIEW
  // =========================================================

  const loadOverview =
    useCallback(async () => {
      try {
        setLoading(true);
        setError(null);

        const response =
          await reportApi.getOverview();

        setOverview(response);

        return response;
      } catch (err) {
        console.error(
          "Failed to load report overview:",
          err
        );

        const message =
          err instanceof Error
            ? err.message
            : "Failed to load report overview.";

        setError(message);

        throw err;
      } finally {
        setLoading(false);
      }
    }, [reportApi]);

  // =========================================================
  // TRAINING COMPLETION
  // =========================================================

  const loadTrainingCompletion =
    useCallback(
      async (
        filter?: ReportFilter
      ) => {
        try {
          setLoading(true);
          setError(null);

          const response =
            await reportApi.getTrainingCompletion(
              filter
            );

          setTrainingCompletion(
            response
          );

          return response;
        } catch (err) {
          console.error(
            "Failed to load training completion report:",
            err
          );

          const message =
            err instanceof Error
              ? err.message
              : "Failed to load training completion report.";

          setError(message);

          throw err;
        } finally {
          setLoading(false);
        }
      },
      [reportApi]
    );

  // =========================================================
  // ENROLLMENTS
  // =========================================================

  const loadEnrollments =
    useCallback(
      async (
        filter?: ReportFilter
      ) => {
        try {
          setLoading(true);
          setError(null);

          const response =
            await reportApi.getEnrollments(
              filter
            );

          setEnrollments(response);

          return response;
        } catch (err) {
          console.error(
            "Failed to load enrollment report:",
            err
          );

          const message =
            err instanceof Error
              ? err.message
              : "Failed to load enrollment report.";

          setError(message);

          throw err;
        } finally {
          setLoading(false);
        }
      },
      [reportApi]
    );

  // =========================================================
  // ATTENDANCE
  // =========================================================

  const loadAttendance =
    useCallback(
      async (
        filter?: ReportFilter
      ) => {
        try {
          setLoading(true);
          setError(null);

          const response =
            await reportApi.getAttendance(
              filter
            );

          setAttendance(response);

          return response;
        } catch (err) {
          console.error(
            "Failed to load attendance report:",
            err
          );

          const message =
            err instanceof Error
              ? err.message
              : "Failed to load attendance report.";

          setError(message);

          throw err;
        } finally {
          setLoading(false);
        }
      },
      [reportApi]
    );

  // =========================================================
  // ASSESSMENT RESULTS
  // =========================================================

  const loadAssessmentResults =
    useCallback(
      async (
        filter?: ReportFilter
      ) => {
        try {
          setLoading(true);
          setError(null);

          const response =
            await reportApi.getAssessmentResults(
              filter
            );

          setAssessmentResults(
            response
          );

          return response;
        } catch (err) {
          console.error(
            "Failed to load assessment results report:",
            err
          );

          const message =
            err instanceof Error
              ? err.message
              : "Failed to load assessment results report.";

          setError(message);

          throw err;
        } finally {
          setLoading(false);
        }
      },
      [reportApi]
    );

  // =========================================================
  // CERTIFICATES
  // =========================================================

  const loadCertificates =
    useCallback(
      async (
        filter?: ReportFilter
      ) => {
        try {
          setLoading(true);
          setError(null);

          const response =
            await reportApi.getCertificates(
              filter
            );

          setCertificates(response);

          return response;
        } catch (err) {
          console.error(
            "Failed to load certificate report:",
            err
          );

          const message =
            err instanceof Error
              ? err.message
              : "Failed to load certificate report.";

          setError(message);

          throw err;
        } finally {
          setLoading(false);
        }
      },
      [reportApi]
    );

  // =========================================================
  // TRAINERS
  // =========================================================

  const loadTrainers =
    useCallback(
      async (
        filter?: ReportFilter
      ) => {
        try {
          setLoading(true);
          setError(null);

          const response =
            await reportApi.getTrainers(
              filter
            );

          setTrainers(response);

          return response;
        } catch (err) {
          console.error(
            "Failed to load trainer report:",
            err
          );

          const message =
            err instanceof Error
              ? err.message
              : "Failed to load trainer report.";

          setError(message);

          throw err;
        } finally {
          setLoading(false);
        }
      },
      [reportApi]
    );

  // =========================================================
  // SERVICE REQUESTS
  // =========================================================

  const loadServiceRequests =
    useCallback(
      async (
        filter?: ReportFilter
      ) => {
        try {
          setLoading(true);
          setError(null);

          const response =
            await reportApi.getServiceRequests(
              filter
            );

          setServiceRequests(
            response
          );

          return response;
        } catch (err) {
          console.error(
            "Failed to load service request report:",
            err
          );

          const message =
            err instanceof Error
              ? err.message
              : "Failed to load service request report.";

          setError(message);

          throw err;
        } finally {
          setLoading(false);
        }
      },
      [reportApi]
    );

  // =========================================================
  // CLEAR ERROR
  // =========================================================

  const clearError =
    useCallback(() => {
      setError(null);
    }, []);

  // =========================================================
  // RETURN
  // =========================================================

  return {
    // Data
    overview,
    trainingCompletion,
    enrollments,
    attendance,
    assessmentResults,
    certificates,
    trainers,
    serviceRequests,

    // State
    loading,
    error,

    // Actions
    loadOverview,
    loadTrainingCompletion,
    loadEnrollments,
    loadAttendance,
    loadAssessmentResults,
    loadCertificates,
    loadTrainers,
    loadServiceRequests,
    clearError,
  };
}