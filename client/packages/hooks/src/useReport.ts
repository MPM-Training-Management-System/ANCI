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

import type { ReportApi } from "@repo/api";

export function useReports(
  reportApi: ReportApi
) {
  // =========================================================
  // STATE
  // =========================================================

  const [overview, setOverview] =
    useState<AdminReportOverview | null>(null);

  const [trainingCompletion, setTrainingCompletion] =
    useState<TrainingCompletionReport | null>(null);

  const [enrollments, setEnrollments] =
    useState<EnrollmentReport | null>(null);

  const [attendance, setAttendance] =
    useState<AttendanceReport | null>(null);

  const [assessmentResults, setAssessmentResults] =
    useState<AssessmentResultsReport | null>(null);

  const [certificates, setCertificates] =
    useState<CertificateReport | null>(null);

  const [trainers, setTrainers] =
    useState<TrainerReport | null>(null);

  const [serviceRequests, setServiceRequests] =
    useState<ServiceRequestReport | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  // =========================================================
  // ERROR HANDLER
  // =========================================================

  const getErrorMessage = useCallback(
    (err: unknown) => {
      if (err instanceof Error) {
        return err.message;
      }

      if (
        typeof err === "object" &&
        err !== null &&
        "message" in err
      ) {
        const message =
          (err as { message?: unknown }).message;

        if (typeof message === "string") {
          return message;
        }
      }

      return "Something went wrong while loading the report.";
    },
    []
  );

  // =========================================================
  // GET OVERVIEW
  // =========================================================

  const getOverview = useCallback(
    async () => {
      try {
        setLoading(true);
        setError(null);

        const result =
          await reportApi.getOverview();

        setOverview(result);

        return result;
      } catch (err) {
        const message =
          getErrorMessage(err);

        setError(message);

        throw err;
      } finally {
        setLoading(false);
      }
    },
    [reportApi, getErrorMessage]
  );

  // =========================================================
  // GET TRAINING COMPLETION
  // =========================================================

  const getTrainingCompletion =
    useCallback(
      async (
        filter?: ReportFilter
      ) => {
        try {
          setLoading(true);
          setError(null);

          const result =
            await reportApi.getTrainingCompletion(
              filter
            );

          setTrainingCompletion(result);

          return result;
        } catch (err) {
          const message =
            getErrorMessage(err);

          setError(message);

          throw err;
        } finally {
          setLoading(false);
        }
      },
      [reportApi, getErrorMessage]
    );

  // =========================================================
  // GET ENROLLMENTS
  // =========================================================

  const getEnrollments =
    useCallback(
      async (
        filter?: ReportFilter
      ) => {
        try {
          setLoading(true);
          setError(null);

          const result =
            await reportApi.getEnrollments(
              filter
            );

          setEnrollments(result);

          return result;
        } catch (err) {
          const message =
            getErrorMessage(err);

          setError(message);

          throw err;
        } finally {
          setLoading(false);
        }
      },
      [reportApi, getErrorMessage]
    );

  // =========================================================
  // GET ATTENDANCE
  // =========================================================

  const getAttendance =
    useCallback(
      async (
        filter?: ReportFilter
      ) => {
        try {
          setLoading(true);
          setError(null);

          const result =
            await reportApi.getAttendance(
              filter
            );

          setAttendance(result);

          return result;
        } catch (err) {
          const message =
            getErrorMessage(err);

          setError(message);

          throw err;
        } finally {
          setLoading(false);
        }
      },
      [reportApi, getErrorMessage]
    );

  // =========================================================
  // GET ASSESSMENT RESULTS
  // =========================================================

  const getAssessmentResults =
    useCallback(
      async (
        filter?: ReportFilter
      ) => {
        try {
          setLoading(true);
          setError(null);

          const result =
            await reportApi.getAssessmentResults(
              filter
            );

          setAssessmentResults(result);

          return result;
        } catch (err) {
          const message =
            getErrorMessage(err);

          setError(message);

          throw err;
        } finally {
          setLoading(false);
        }
      },
      [reportApi, getErrorMessage]
    );

  // =========================================================
  // GET CERTIFICATES
  // =========================================================

  const getCertificates =
    useCallback(
      async (
        filter?: ReportFilter
      ) => {
        try {
          setLoading(true);
          setError(null);

          const result =
            await reportApi.getCertificates(
              filter
            );

          setCertificates(result);

          return result;
        } catch (err) {
          const message =
            getErrorMessage(err);

          setError(message);

          throw err;
        } finally {
          setLoading(false);
        }
      },
      [reportApi, getErrorMessage]
    );

  // =========================================================
  // GET TRAINERS
  // =========================================================

  const getTrainers =
    useCallback(
      async (
        filter?: ReportFilter
      ) => {
        try {
          setLoading(true);
          setError(null);

          const result =
            await reportApi.getTrainers(
              filter
            );

          setTrainers(result);

          return result;
        } catch (err) {
          const message =
            getErrorMessage(err);

          setError(message);

          throw err;
        } finally {
          setLoading(false);
        }
      },
      [reportApi, getErrorMessage]
    );

  // =========================================================
  // GET SERVICE REQUESTS
  // =========================================================

  const getServiceRequests =
    useCallback(
      async (
        filter?: ReportFilter
      ) => {
        try {
          setLoading(true);
          setError(null);

          const result =
            await reportApi.getServiceRequests(
              filter
            );

          setServiceRequests(result);

          return result;
        } catch (err) {
          const message =
            getErrorMessage(err);

          setError(message);

          throw err;
        } finally {
          setLoading(false);
        }
      },
      [reportApi, getErrorMessage]
    );

  // =========================================================
  // LOAD ALL REPORTS
  // =========================================================

  const getAllReports =
    useCallback(
      async (
        filter?: ReportFilter
      ) => {
        try {
          setLoading(true);
          setError(null);

          const [
            overviewResult,
            trainingCompletionResult,
            enrollmentsResult,
            attendanceResult,
            assessmentResultsResult,
            certificatesResult,
            trainersResult,
            serviceRequestsResult,
          ] = await Promise.all([
            reportApi.getOverview(),

            reportApi.getTrainingCompletion(
              filter
            ),

            reportApi.getEnrollments(
              filter
            ),

            reportApi.getAttendance(
              filter
            ),

            reportApi.getAssessmentResults(
              filter
            ),

            reportApi.getCertificates(
              filter
            ),

            reportApi.getTrainers(
              filter
            ),

            reportApi.getServiceRequests(
              filter
            ),
          ]);

          setOverview(
            overviewResult
          );

          setTrainingCompletion(
            trainingCompletionResult
          );

          setEnrollments(
            enrollmentsResult
          );

          setAttendance(
            attendanceResult
          );

          setAssessmentResults(
            assessmentResultsResult
          );

          setCertificates(
            certificatesResult
          );

          setTrainers(
            trainersResult
          );

          setServiceRequests(
            serviceRequestsResult
          );

          return {
            overview: overviewResult,
            trainingCompletion:
              trainingCompletionResult,
            enrollments:
              enrollmentsResult,
            attendance:
              attendanceResult,
            assessmentResults:
              assessmentResultsResult,
            certificates:
              certificatesResult,
            trainers:
              trainersResult,
            serviceRequests:
              serviceRequestsResult,
          };
        } catch (err) {
          const message =
            getErrorMessage(err);

          setError(message);

          throw err;
        } finally {
          setLoading(false);
        }
      },
      [reportApi, getErrorMessage]
    );

  // =========================================================
  // CLEAR REPORTS
  // =========================================================

  const clearReports =
    useCallback(() => {
      setOverview(null);
      setTrainingCompletion(null);
      setEnrollments(null);
      setAttendance(null);
      setAssessmentResults(null);
      setCertificates(null);
      setTrainers(null);
      setServiceRequests(null);
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

    // Individual loaders
    getOverview,
    getTrainingCompletion,
    getEnrollments,
    getAttendance,
    getAssessmentResults,
    getCertificates,
    getTrainers,
    getServiceRequests,

    // Bulk loader
    getAllReports,

    // Utilities
    clearReports,
  };
}