import type {
  CreateTrainingProgramRequest,
  TrainingProgram,
  UpdateTrainingProgramRequest,
} from "@repo/types";

import {
  ApiClient,
} from "../api/client";

import {
  TrainingProgramEndpoint,
} from "./TrainingProgramEndpoint";


export class TrainingProgramApi {

  constructor(
    private readonly api: ApiClient
  ) {}


  // ==========================================
  // GET ALL
  // ==========================================

  async getAll(): Promise<TrainingProgram[]> {
    return this.api.request<TrainingProgram[]>(
      TrainingProgramEndpoint.get,
      {
        method: "GET",
      }
    );
  }


  // ==========================================
  // GET BY ID
  // ==========================================

  async getById(
    id: string
  ): Promise<TrainingProgram> {

    return this.api.request<TrainingProgram>(
      TrainingProgramEndpoint.byId(id),
      {
        method: "GET",
      }
    );
  }


  // ==========================================
  // CREATE
  // ==========================================

  async create(
    request: CreateTrainingProgramRequest
  ): Promise<TrainingProgram> {

    return this.api.request<TrainingProgram>(
      TrainingProgramEndpoint.create,
      {
        method: "POST",

        /*
         * ApiClient already performs
         * JSON.stringify().
         */
        body: request,
      }
    );
  }


  // ==========================================
  // UPDATE
  // ==========================================

  async update(
    id: string,
    request: UpdateTrainingProgramRequest
  ): Promise<void> {

    await this.api.request<void>(
      TrainingProgramEndpoint.update(id),
      {
        method: "PUT",

        /*
         * ApiClient already performs
         * JSON.stringify().
         */
        body: request,
      }
    );
  }


  // ==========================================
  // DELETE
  // ==========================================

  async delete(
    id: string
  ): Promise<void> {

    await this.api.request<void>(
      TrainingProgramEndpoint.delete(id),
      {
        method: "DELETE",
      }
    );
  }
}