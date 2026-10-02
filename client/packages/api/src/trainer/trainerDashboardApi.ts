import type {
  TrainerDashboard,
} from "@repo/types";

import type {
  ApiClient,
} from "../api/client";

export class TrainerDashboardApi {
  constructor(
    private readonly client: ApiClient
  ) {}

  async getDashboard(): Promise<TrainerDashboard> {
    return this.client.get<TrainerDashboard>(
      "/api/trainer-dashboard"
    );
  }
}