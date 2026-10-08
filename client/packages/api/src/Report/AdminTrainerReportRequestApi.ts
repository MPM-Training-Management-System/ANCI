import type {
  AdminTrainerReportRequest,
  ReviewTrainerReportRequest,
} from "@repo/types";

import { ApiClient } from "../api/client";
import { AdminTrainerReportRequestEndpoints } from "./AdminTrainerReportRequestEndpoints";

export class AdminTrainerReportRequestApi {
  private readonly client: ApiClient;

  constructor(client: ApiClient) {
    this.client = client;
  }

  async getAllRequests(): Promise<
    AdminTrainerReportRequest[]
  > {
    return this.client.get<
      AdminTrainerReportRequest[]
    >(
      AdminTrainerReportRequestEndpoints.list
    );
  }

  async approveAndGenerate(
    requestId: string,
    file: Blob,
    adminRemarks?: string | null
  ): Promise<AdminTrainerReportRequest> {
    const formData = new FormData();

    formData.append(
      "file",
      file,
      `anci-${requestId}.pdf`
    );

    if (
      adminRemarks &&
      adminRemarks.trim()
    ) {
      formData.append(
        "adminRemarks",
        adminRemarks.trim()
      );
    }

    return this.client.post<
      AdminTrainerReportRequest
    >(
      AdminTrainerReportRequestEndpoints.approveAndGenerate(
        requestId
      ),
      formData
    );
  }

  async reject(
    requestId: string,
    payload: ReviewTrainerReportRequest
  ): Promise<AdminTrainerReportRequest> {
    return this.client.post<
      AdminTrainerReportRequest
    >(
      AdminTrainerReportRequestEndpoints.reject(
        requestId
      ),
      payload
    );
  }
}