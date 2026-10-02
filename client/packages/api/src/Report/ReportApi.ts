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

import { ApiClient } from "../api/client";
import { ReportEndpoints } from "./ReportEndpoints";

export class ReportApi {
  constructor(
    private readonly api: ApiClient
  ) {}

  // =========================================================
  // HELPER
  // =========================================================

  private buildQuery(
    filter?: ReportFilter
  ): string {
    if (!filter) {
      return "";
    }

    const params = new URLSearchParams();

    // =======================================================
    // TRAINING PROGRAM
    // =======================================================

    if (filter.trainingProgramId) {
      params.set(
        "trainingProgramId",
        filter.trainingProgramId
      );
    }

    // =======================================================
    // TRAINING BATCH
    // =======================================================

    if (filter.trainingBatchId) {
      params.set(
        "trainingBatchId",
        filter.trainingBatchId
      );
    }

    // =======================================================
    // TRAINER
    // =======================================================

    if (filter.trainerProfileId) {
      params.set(
        "trainerProfileId",
        filter.trainerProfileId
      );
    }

    // =======================================================
    // DATE FROM
    // =======================================================

    if (filter.dateFrom) {
      params.set(
        "dateFrom",
        filter.dateFrom
      );
    }

    // =======================================================
    // DATE TO
    // =======================================================

    if (filter.dateTo) {
      params.set(
        "dateTo",
        filter.dateTo
      );
    }

    // =======================================================
    // STATUS
    // =======================================================

    if (filter.status) {
      params.set(
        "status",
        filter.status
      );
    }

    // =======================================================
    // SEARCH
    // =======================================================

    if (filter.search) {
      params.set(
        "search",
        filter.search
      );
    }

    // =======================================================
    // PAGE
    // =======================================================

    if (
      filter.page !== undefined &&
      filter.page !== null
    ) {
      params.set(
        "page",
        String(filter.page)
      );
    }

    // =======================================================
    // PAGE SIZE
    // =======================================================

    if (
      filter.pageSize !== undefined &&
      filter.pageSize !== null
    ) {
      params.set(
        "pageSize",
        String(filter.pageSize)
      );
    }

    const query =
      params.toString();

    return query
      ? `?${query}`
      : "";
  }

  // =========================================================
  // ADMIN OVERVIEW
  // =========================================================

  async getOverview(): Promise<
    AdminReportOverview
  > {
    return this.api.request<AdminReportOverview>(
      ReportEndpoints.overview,
      {
        method: "GET",
      }
    );
  }

  // =========================================================
  // TRAINING COMPLETION
  // =========================================================

  async getTrainingCompletion(
    filter?: ReportFilter
  ): Promise<TrainingCompletionReport> {
    const query =
      this.buildQuery(filter);

    return this.api.request<TrainingCompletionReport>(
      `${ReportEndpoints.trainingCompletion}${query}`,
      {
        method: "GET",
      }
    );
  }

  // =========================================================
  // ENROLLMENTS
  // =========================================================

  async getEnrollments(
    filter?: ReportFilter
  ): Promise<EnrollmentReport> {
    const query =
      this.buildQuery(filter);

    return this.api.request<EnrollmentReport>(
      `${ReportEndpoints.enrollments}${query}`,
      {
        method: "GET",
      }
    );
  }

  // =========================================================
  // ATTENDANCE
  // =========================================================

  async getAttendance(
    filter?: ReportFilter
  ): Promise<AttendanceReport> {
    const query =
      this.buildQuery(filter);

    return this.api.request<AttendanceReport>(
      `${ReportEndpoints.attendance}${query}`,
      {
        method: "GET",
      }
    );
  }

  // =========================================================
  // ASSESSMENT RESULTS
  // =========================================================

  async getAssessmentResults(
    filter?: ReportFilter
  ): Promise<AssessmentResultsReport> {
    const query =
      this.buildQuery(filter);

    return this.api.request<AssessmentResultsReport>(
      `${ReportEndpoints.assessmentResults}${query}`,
      {
        method: "GET",
      }
    );
  }

  // =========================================================
  // CERTIFICATES
  // =========================================================

  async getCertificates(
    filter?: ReportFilter
  ): Promise<CertificateReport> {
    const query =
      this.buildQuery(filter);

    return this.api.request<CertificateReport>(
      `${ReportEndpoints.certificates}${query}`,
      {
        method: "GET",
      }
    );
  }

  // =========================================================
  // TRAINERS
  // =========================================================

  async getTrainers(
    filter?: ReportFilter
  ): Promise<TrainerReport> {
    const query =
      this.buildQuery(filter);

    return this.api.request<TrainerReport>(
      `${ReportEndpoints.trainers}${query}`,
      {
        method: "GET",
      }
    );
  }

  // =========================================================
  // SERVICE REQUESTS
  // =========================================================

  async getServiceRequests(
    filter?: ReportFilter
  ): Promise<ServiceRequestReport> {
    const query =
      this.buildQuery(filter);

    return this.api.request<ServiceRequestReport>(
      `${ReportEndpoints.serviceRequests}${query}`,
      {
        method: "GET",
      }
    );
  }
}