import type {
  TrainingBatch,
  CreateTrainingBatchRequest,
  UpdateTrainingBatchRequest,
  UpdateTrainingBatchStatusRequest,
} from "@repo/types";

import {
  ApiClient,
} from "../api/client";

import {
  TrainingBatchEndpoints,
} from "./TrainingBatchEndpoint";


export class TrainingBatchApi {

  constructor(
    private readonly api: ApiClient
  ) {}


  

  async getAll(): Promise<TrainingBatch[]> {

    return this.api.request<TrainingBatch[]>(
      TrainingBatchEndpoints.getAll,
      {
        method: "GET",
      }
    );
  }

  async getAssigned(): Promise<TrainingBatch[]> {

    return this.api.request<TrainingBatch[]>(
      TrainingBatchEndpoints.assigned,
      {
        method: "GET",
      }
    );
  }



  async getById(
    id: string
  ): Promise<TrainingBatch> {

    return this.api.request<TrainingBatch>(
      TrainingBatchEndpoints.byId(id),
      {
        method: "GET",
      }
    );
  }


  // =========================================================
  // CREATE TRAINING BATCH
  // POST /api/training-batches
  // =========================================================

  async create(
    request: CreateTrainingBatchRequest
  ): Promise<TrainingBatch> {

    return this.api.request<TrainingBatch>(
      TrainingBatchEndpoints.create,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        // IMPORTANT:
        // DO NOT JSON.stringify HERE.
        // ApiClient already stringifies the body.
        body: request,
      }
    );
  }


  // =========================================================
  // UPDATE TRAINING BATCH
  // PUT /api/training-batches/{id}
  // =========================================================

  async update(
    id: string,
    request: UpdateTrainingBatchRequest
  ): Promise<void> {

    await this.api.request<void>(
      TrainingBatchEndpoints.update(id),
      {
        method: "PUT",

        headers: {
          "Content-Type": "application/json",
        },

        // IMPORTANT:
        // DO NOT JSON.stringify HERE.
        body: request,
      }
    );
  }


  // =========================================================
  // UPDATE TRAINING BATCH STATUS
  // PUT /api/training-batches/{id}/status
  // =========================================================

  async updateStatus(
    id: string,
    status: UpdateTrainingBatchStatusRequest
  ): Promise<void> {

    await this.api.request<void>(
      TrainingBatchEndpoints.status(id),
      {
        method: "PUT",

        headers: {
          "Content-Type": "application/json",
        },

        // IMPORTANT:
        // DO NOT JSON.stringify HERE.
        body: status,
      }
    );
  }


  async delete(
  id: string
): Promise<void> {

  await this.api.request<void>(
    TrainingBatchEndpoints.delete(id),
    {
      method: "DELETE",
    }
  );
}
}