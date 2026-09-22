import {
  ApiClient,
} from "../api/client";

import {
  PracticalAssessmentEndpoints,
} from "./WrittenAssessmentEndpoints";

import type {
  PracticalAssessment,
  PracticalAssessmentResult,
  CreatePracticalAssessmentRequest,
  EvaluatePracticalAssessmentRequest,
} from "@repo/types";

// =========================================================
// PRACTICAL ASSESSMENT API
//
// Shared API client for:
// Admin Web
// Trainer Web
//
// JSON serialization is handled by ApiClient.
// Do NOT JSON.stringify() request bodies here.
// =========================================================

export class PracticalAssessmentApi {

  constructor(
    private readonly api: ApiClient
  ) {}

  // =======================================================
  // ADMIN
  // PRACTICAL ASSESSMENT
  // =======================================================

  async getAll(): Promise<PracticalAssessment[]> {

    return this.api.request<PracticalAssessment[]>(
      PracticalAssessmentEndpoints.getAll(),
      {
        method: "GET",
      }
    );
  }

  async getById(
    id: string
  ): Promise<PracticalAssessment> {

    return this.api.request<PracticalAssessment>(
      PracticalAssessmentEndpoints.getById(id),
      {
        method: "GET",
      }
    );
  }

  async create(
    request: CreatePracticalAssessmentRequest
  ): Promise<PracticalAssessment> {

    return this.api.request<PracticalAssessment>(
      PracticalAssessmentEndpoints.create(),
      {
        method: "POST",

        body: request,
      }
    );
  }

  async update(
    id: string,
    request: CreatePracticalAssessmentRequest
  ): Promise<PracticalAssessment> {

    return this.api.request<PracticalAssessment>(
      PracticalAssessmentEndpoints.update(id),
      {
        method: "PUT",

        body: request,
      }
    );
  }

  async delete(
    id: string
  ): Promise<void> {

    await this.api.request<void>(
      PracticalAssessmentEndpoints.delete(id),
      {
        method: "DELETE",
      }
    );
  }

  async setPublished(
    id: string,
    isPublished: boolean
  ): Promise<PracticalAssessment> {

    return this.api.request<PracticalAssessment>(
      PracticalAssessmentEndpoints.publish(
        id,
        isPublished
      ),
      {
        method: "PUT",
      }
    );
  }

  // =======================================================
  // TRAINER
  // PRACTICAL ASSESSMENT
  // =======================================================

  async getTrainerAssessments(): Promise<PracticalAssessment[]> {

    return this.api.request<PracticalAssessment[]>(
      PracticalAssessmentEndpoints.getTrainerAssessments(),
      {
        method: "GET",
      }
    );
  }

  // =======================================================
  // TRAINER
  // EVALUATE PRACTICAL ASSESSMENT
  // =======================================================

  async evaluate(
    request: EvaluatePracticalAssessmentRequest
  ): Promise<PracticalAssessmentResult> {

    return this.api.request<PracticalAssessmentResult>(
      PracticalAssessmentEndpoints.evaluate(),
      {
        method: "POST",

        body: request,
      }
    );
  }

  // =======================================================
  // TRAINER
  // RESULTS
  // =======================================================

  async getResults(
    assessmentId: string
  ): Promise<PracticalAssessmentResult[]> {

    return this.api.request<PracticalAssessmentResult[]>(
      PracticalAssessmentEndpoints.getResults(
        assessmentId
      ),
      {
        method: "GET",
      }
    );
  }

  async getResult(
    enrollmentId: string
  ): Promise<PracticalAssessmentResult> {

    return this.api.request<PracticalAssessmentResult>(
      PracticalAssessmentEndpoints.getResult(
        enrollmentId
      ),
      {
        method: "GET",
      }
    );
  }
}