
import type {
  FullUserRecoveryPreview,
  FullUserRecoveryResult,
} from "@repo/types";

import type { ApiClient } from "../api/client";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export class AdminRecoveryApi {
  constructor(private readonly api: ApiClient) {}

  async previewFullUserRecovery(
    userCode: string,
  ): Promise<FullUserRecoveryPreview> {
    const normalizedUserCode = userCode.trim();

    if (!normalizedUserCode) {
      throw new Error("User Code is required.");
    }

    const response = await this.api.get<
      ApiResponse<FullUserRecoveryPreview>
    >(
      `/api/admin/recovery/full-user/${encodeURIComponent(normalizedUserCode)}/preview`,
    );

    return response.data;
  }

  async restoreFullUser(
    userCode: string,
  ): Promise<FullUserRecoveryResult> {
    const normalizedUserCode = userCode.trim();

    if (!normalizedUserCode) {
      throw new Error("User Code is required.");
    }

    const response = await this.api.post<
      ApiResponse<FullUserRecoveryResult>
    >(
      `/api/admin/recovery/full-user/${encodeURIComponent(normalizedUserCode)}/restore`,
      {},
    );

    return response.data;
  }
}
