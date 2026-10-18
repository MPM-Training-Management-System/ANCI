
import type {
  TrainingBatch,
  CreateTrainingBatchRequest,
  UpdateTrainingBatchRequest,
  UpdateTrainingBatchStatusRequest,
  TrainingScheduleRecommendation,
  GenerateTrainingScheduleRequest,
  CreateManualTrainingScheduleRequest,
  TrainingSession,
} from "@repo/types";

import { ApiClient } from "../api/client";

import { TrainingBatchEndpoints } from "./TrainingBatchEndpoint";
import { TrainingScheduleEndpoints } from "./TrainingScheduleEndpoints";

// ============================================================
// TRAINING BATCH API
// ============================================================

export class TrainingBatchApi {
  constructor(
    private readonly api: ApiClient,
  ) {}

  // ============================================================
  // GET ALL TRAINING BATCHES
  // GET /api/training-batches
  // ============================================================

  async getAll(): Promise<TrainingBatch[]> {
    return this.api.request<TrainingBatch[]>(
      TrainingBatchEndpoints.getAll,
      {
        method: "GET",
      },
    );
  }

  // ============================================================
  // GET ASSIGNED TRAINING BATCHES
  // GET /api/training-batches/assigned
  // ============================================================

  async getAssigned(): Promise<TrainingBatch[]> {
    return this.api.request<TrainingBatch[]>(
      TrainingBatchEndpoints.assigned,
      {
        method: "GET",
      },
    );
  }

  // ============================================================
  // GET TRAINING BATCH BY ID
  // GET /api/training-batches/{id}
  // ============================================================

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

  // ============================================================
  // CREATE TRAINING BATCH
  // POST /api/training-batches
  // ============================================================

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
        body: request,
      },
    );
  }

  // ============================================================
  // UPDATE TRAINING BATCH
  // PUT /api/training-batches/{id}
  // ============================================================

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
        body: request,
      },
    );
  }

  // ============================================================
  // UPDATE TRAINING BATCH STATUS
  // PUT /api/training-batches/{id}/status
  // ============================================================

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
        body: status,
      },
    );
  }

  // ============================================================
  // DELETE TRAINING BATCH
  // DELETE /api/training-batches/{id}
  // ============================================================

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
  // GET SCHEDULE RECOMMENDATION
  // GET /api/training-batches/{id}/schedule/recommendation
  // ============================================================

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

  // ============================================================
  // GENERATE AUTOMATIC SCHEDULE PREVIEW
  // POST /api/training-batches/{id}/schedule/generate
  //
  // Returns a preview. The backend does not save these sessions.
  // ============================================================

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
        body: request,
      },
    );
  }

  // ============================================================
  // CREATE MANUAL TRAINING SCHEDULE
  // POST /api/training-batches/{id}/schedule/manual/preview
  //
  // IMPORTANT:
  // Despite "preview" in the URL, the current backend saves
  // the manual sessions to the database.
  // Admin only.
  // ============================================================

  async createManualSchedule(
    trainingBatchId: string,
    request: CreateManualTrainingScheduleRequest,
  ): Promise<TrainingSession[]> {
    return this.api.request<TrainingSession[]>(
      TrainingScheduleEndpoints.createManual(
        trainingBatchId,
      ),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          ...request,
          trainingBatchId,
        },
      },
    );
  }

  // ============================================================
  // GET SAVED TRAINING SCHEDULE
  // GET /api/training-batches/{id}/schedule
  // ============================================================

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

  // ============================================================
  // GET PARTICIPANT TRAINING SCHEDULE
  // GET /api/training-batches/{id}/schedule/participant
  // ============================================================

  async getParticipantSchedule(
    trainingBatchId: string,
  ): Promise<TrainingSession[]> {
    return this.api.request<TrainingSession[]>(
      TrainingScheduleEndpoints.getParticipantSchedule(
        trainingBatchId,
      ),
      {
        method: "GET",
      },
    );
  }

  // ============================================================
  // APPROVE TRAINING SCHEDULE
  // POST /api/training-batches/{id}/schedule/approve
  // ============================================================

  async approveSchedule(
    trainingBatchId: string,
    sessions: TrainingSession[],
  ): Promise<void> {
    await this.api.request<void>(
      TrainingScheduleEndpoints.approve(
        trainingBatchId,
      ),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          sessions,
        },
      },
    );
  }
}
