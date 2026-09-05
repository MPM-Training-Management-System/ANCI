import type {
  TrainingBatch,
  CreateTrainingBatchRequest,
  UpdateTrainingBatchRequest,
  UpdateTrainingBatchStatusRequest,
  TrainingScheduleRecommendation,
  GenerateTrainingScheduleRequest,
  TrainingSession,
} from "@repo/types";

import {
  ApiClient,
} from "../api/client";

import {
  TrainingBatchEndpoints,
} from "./TrainingBatchEndpoint";

// ============================================================
// TRAINING SCHEDULE ENDPOINTS
// ============================================================

export const TrainingScheduleEndpoints = {

  // =========================================================
  // GET SCHEDULE RECOMMENDATION
  // GET /api/training-batches/{trainingBatchId}/schedule/recommendation
  // =========================================================

  recommendation: (
    trainingBatchId: string,
  ) =>
    `/api/training-batches/${trainingBatchId}/schedule/recommendation`,

  // =========================================================
  // GENERATE TRAINING SCHEDULE
  // POST /api/training-batches/{trainingBatchId}/schedule/generate
  // =========================================================

  generate: (
    trainingBatchId: string,
  ) =>
    `/api/training-batches/${trainingBatchId}/schedule/generate`,

  // =========================================================
  // GET TRAINING SCHEDULE
  // GET /api/training-batches/{trainingBatchId}/schedule
  // =========================================================

  getByBatchId: (
    trainingBatchId: string,
  ) =>
    `/api/training-batches/${trainingBatchId}/schedule`,

  // =========================================================
  // APPROVE TRAINING SCHEDULE
  // POST /api/training-batches/{trainingBatchId}/schedule/approve
  // =========================================================

  approve: (
    trainingBatchId: string,
  ) =>
    `/api/training-batches/${trainingBatchId}/schedule/approve`,
};


// ============================================================
// TRAINING BATCH API
// ============================================================

export class TrainingBatchApi {

  constructor(
    private readonly api: ApiClient,
  ) {}

  // =========================================================
  // GET ALL TRAINING BATCHES
  // GET /api/training-batches
  // =========================================================

  async getAll(): Promise<TrainingBatch[]> {

    return this.api.request<TrainingBatch[]>(
      TrainingBatchEndpoints.getAll,
      {
        method: "GET",
      },
    );
  }


  // =========================================================
  // GET ASSIGNED TRAINING BATCHES
  // GET /api/training-batches/assigned
  // =========================================================

  async getAssigned(): Promise<TrainingBatch[]> {

    return this.api.request<TrainingBatch[]>(
      TrainingBatchEndpoints.assigned,
      {
        method: "GET",
      },
    );
  }


  // =========================================================
  // GET TRAINING BATCH BY ID
  // GET /api/training-batches/{id}
  // =========================================================

  async getById(
    id: string,
  ): Promise<TrainingBatch> {

    return this.api.request<TrainingBatch>(
      TrainingBatchEndpoints.byId(id),
      {
        method: "GET",
      },
    );
  }


  // =========================================================
  // CREATE TRAINING BATCH
  // POST /api/training-batches
  // =========================================================

  async create(
    request: CreateTrainingBatchRequest,
  ): Promise<TrainingBatch> {

    return this.api.request<TrainingBatch>(
      TrainingBatchEndpoints.create,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        // ApiClient already stringifies the body.
        body: request,
      },
    );
  }


  // =========================================================
  // UPDATE TRAINING BATCH
  // PUT /api/training-batches/{id}
  // =========================================================

  async update(
    id: string,
    request: UpdateTrainingBatchRequest,
  ): Promise<void> {

    await this.api.request<void>(
      TrainingBatchEndpoints.update(id),
      {
        method: "PUT",

        headers: {
          "Content-Type": "application/json",
        },

        // ApiClient already stringifies the body.
        body: request,
      },
    );
  }


  // =========================================================
  // UPDATE TRAINING BATCH STATUS
  // PUT /api/training-batches/{id}/status
  // =========================================================

  async updateStatus(
    id: string,
    status: UpdateTrainingBatchStatusRequest,
  ): Promise<void> {

    await this.api.request<void>(
      TrainingBatchEndpoints.status(id),
      {
        method: "PUT",

        headers: {
          "Content-Type": "application/json",
        },

        // ApiClient already stringifies the body.
        body: status,
      },
    );
  }


  // =========================================================
  // DELETE TRAINING BATCH
  // DELETE /api/training-batches/{id}
  // =========================================================

  async delete(
    id: string,
  ): Promise<void> {

    await this.api.request<void>(
      TrainingBatchEndpoints.delete(id),
      {
        method: "DELETE",
      },
    );
  }


  // ============================================================
  // TRAINING SCHEDULE
  // ============================================================


  // =========================================================
  // GET SCHEDULE RECOMMENDATION
  // GET /api/training-batches/{id}/schedule/recommendation
  // =========================================================

  async getScheduleRecommendation(
    trainingBatchId: string,
  ): Promise<TrainingScheduleRecommendation> {

    return this.api.request<TrainingScheduleRecommendation>(
      TrainingScheduleEndpoints.recommendation(
        trainingBatchId,
      ),
      {
        method: "GET",
      },
    );
  }


  // =========================================================
  // GENERATE TRAINING SCHEDULE
  // POST /api/training-batches/{id}/schedule/generate
  // =========================================================

  async generateSchedule(
    trainingBatchId: string,
    request: GenerateTrainingScheduleRequest,
  ): Promise<TrainingSession[]> {

    return this.api.request<TrainingSession[]>(
      TrainingScheduleEndpoints.generate(
        trainingBatchId,
      ),
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        // ApiClient already stringifies the body.
        body: request,
      },
    );
  }


  // =========================================================
  // GET TRAINING SCHEDULE
  // GET /api/training-batches/{id}/schedule
  // =========================================================

  async getSchedule(
    trainingBatchId: string,
  ): Promise<TrainingSession[]> {

    return this.api.request<TrainingSession[]>(
      TrainingScheduleEndpoints.getByBatchId(
        trainingBatchId,
      ),
      {
        method: "GET",
      },
    );
  }

  async getParticipantSchedule(
  trainingBatchId: string,
): Promise<TrainingSession[]> {
  return this.api.request<TrainingSession[]>(
    TrainingBatchEndpoints.getParticipantSchedule(trainingBatchId),
    {
      method: "GET",
    },
  );
}

  // =========================================================
  // APPROVE TRAINING SCHEDULE
  // POST /api/training-batches/{id}/schedule/approve
  // =========================================================

async approveSchedule(
  trainingBatchId: string,
  sessions: TrainingSession[],
) {
  return this.api.post(
    TrainingScheduleEndpoints.approve(trainingBatchId),
    {
      sessions,
    },
  );
}
}