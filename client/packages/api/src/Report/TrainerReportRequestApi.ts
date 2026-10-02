import type {
  CreateTrainerReportRequest,
  TrainerReportRequest,
  TrainerReportRequestListResponse,
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

  async getMyRequests(): Promise<TrainerReportRequestListResponse> {
    return this.client.get<TrainerReportRequestListResponse>(
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

  async getAdminRequests(): Promise<TrainerReportRequestListResponse> {
    return this.client.get<TrainerReportRequestListResponse>(
      TrainerReportRequestEndpoints.adminRequests
    );
  }

  async approveRequest(
    id: string,
    adminRemarks?: string
  ): Promise<TrainerReportRequest> {
    return this.client.post<TrainerReportRequest>(
      TrainerReportRequestEndpoints.approve(id),
      {
        adminRemarks,
      }
    );
  }

  async rejectRequest(
    id: string,
    adminRemarks: string
  ): Promise<TrainerReportRequest> {
    return this.client.post<TrainerReportRequest>(
      TrainerReportRequestEndpoints.reject(id),
      {
        adminRemarks,
      }
    );
  }
}