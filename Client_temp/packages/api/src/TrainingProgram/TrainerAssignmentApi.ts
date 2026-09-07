import type {
  TrainerAssignment,
  AssignTrainerRequest,
} from "@repo/types";

import {
  ApiClient,
} from "../api/client";

import {
  TrainerAssignmentEndpoints,
} from "./TrainerAssignmentEndpoint";


export class TrainerAssignmentApi {

  constructor(
    private readonly api: ApiClient
  ) {}


  // =========================================================
  // GET ALL TRAINER ASSIGNMENTS
  // GET /api/trainer-assignments
  // =========================================================

  async getAll(): Promise<TrainerAssignment[]> {

    return this.api.request<TrainerAssignment[]>(
      TrainerAssignmentEndpoints.getAll,
      {
        method: "GET",
      }
    );
  }


  // =========================================================
  // GET MY TRAINER ASSIGNMENTS
  // GET /api/trainer-assignments/me
  // =========================================================

  async getMyAssignments(): Promise<TrainerAssignment[]> {

    return this.api.request<TrainerAssignment[]>(
      TrainerAssignmentEndpoints.me,
      {
        method: "GET",
      }
    );
  }


  // =========================================================
  // CREATE TRAINER ASSIGNMENT
  // POST /api/trainer-assignments
  // =========================================================

  async create(
    request: AssignTrainerRequest
  ): Promise<TrainerAssignment> {

    return this.api.request<TrainerAssignment>(
      TrainerAssignmentEndpoints.create,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        // ApiClient handles JSON.stringify()
        body: request,
      }
    );
  }


  // =========================================================
  // DELETE TRAINER ASSIGNMENT
  // DELETE /api/trainer-assignments/{id}
  // =========================================================

  async delete(
    id: string
  ): Promise<void> {

    await this.api.request<void>(
      TrainerAssignmentEndpoints.byId(id),
      {
        method: "DELETE",
      }
    );
  }
}