import {
  ApiClient,
} from "../api/client";

import {
  TrainingGradeEndpoints,
} from "./TrainingGradeEndpoints";

import type {
  TrainingGrade,
} from "@repo/types";

// =========================================================
// TRAINING GRADE API
//
// Shared API client for:
// Admin Web
// Trainer Web
// Participant Mobile
//
// JSON serialization is handled by ApiClient.
// Do NOT JSON.stringify() request bodies here.
// =========================================================

export class TrainingGradeApi {

  constructor(
    private readonly api: ApiClient
  ) {}

  async getAll(): Promise<TrainingGrade[]> {
    return this.api.request<TrainingGrade[]>(
      TrainingGradeEndpoints.getAll(),
      {
        method: "GET",
      }
    );
  }

  async getByEnrollment(
    enrollmentId: string
  ): Promise<TrainingGrade> {

    return this.api.request<TrainingGrade>(
      TrainingGradeEndpoints.getByEnrollment(
        enrollmentId
      ),
      {
        method: "GET",
      }
    );
  }
}