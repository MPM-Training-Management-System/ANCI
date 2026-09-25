import { ApiClient } from "../api/client";
import { AdminDashboardEndpoints } from "./AdminDashboardEndpoints";

import type { AdminDashboard } from "@repo/types";

export class AdminDashboardApi {
  constructor(private readonly api: ApiClient) {}

  // ==========================================
  // ADMIN DASHBOARD
  // ==========================================

  /**
   * Admin - get dashboard statistics and recent data
   */
  async getDashboard(): Promise<AdminDashboard> {
    return this.api.request<AdminDashboard>(
      AdminDashboardEndpoints.getDashboard(),
      {
        method: "GET",
      }
    );
  }
}