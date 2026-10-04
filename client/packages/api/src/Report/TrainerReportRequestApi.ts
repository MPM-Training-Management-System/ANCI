import type {
  AdminTrainerReportRequest,
  CreateTrainerReportRequest,
  ReviewTrainerReportRequest,
  TrainerReportRequest,
} from "@repo/types";

import { ApiClient } from "../api/client";
import { TrainerReportRequestEndpoints } from "./TrainerReportRequestEndpoints";

export class TrainerReportRequestApi {
  private readonly client: ApiClient;

  constructor(client: ApiClient) {
    this.client = client;
  }

  // =========================================================
  // TRAINER
  // =========================================================

  async getMyRequests(): Promise<TrainerReportRequest[]> {
    return this.client.get<TrainerReportRequest[]>(
      TrainerReportRequestEndpoints.myRequests
    );
  }

  async createRequest(
    payload: CreateTrainerReportRequest
  ): Promise<TrainerReportRequest> {
    return this.client.post<TrainerReportRequest>(
      TrainerReportRequestEndpoints.create,
      payload
    );
  }

  // =========================================================
  // ADMIN
  // =========================================================

  async getAdminRequests(): Promise<AdminTrainerReportRequest[]> {
    return this.client.get<AdminTrainerReportRequest[]>(
      TrainerReportRequestEndpoints.adminRequests
    );
  }

  async approveRequest(
    id: string,
    payload: ReviewTrainerReportRequest
  ): Promise<AdminTrainerReportRequest> {
    return this.client.post<AdminTrainerReportRequest>(
      TrainerReportRequestEndpoints.approve(id),
      payload
    );
  }

  async rejectRequest(
    id: string,
    payload: ReviewTrainerReportRequest
  ): Promise<AdminTrainerReportRequest> {
    return this.client.post<AdminTrainerReportRequest>(
      TrainerReportRequestEndpoints.reject(id),
      payload
    );
  }
}