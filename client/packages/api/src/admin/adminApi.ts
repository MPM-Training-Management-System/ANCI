import { ApiClient } from "../api/client";
import { ParticipantEndpoints } from "../participant";
import { AdminEndpoints } from "./admin.endpoint";

import type {
  AdminProfile,
} from "@repo/types";

export class AdminApi {
  constructor(private api: ApiClient) {}



  async getMe():
  Promise<AdminProfile> {
    return this.api.request<AdminProfile>(
      AdminEndpoints.getMe,
      {
        method: "GET",
      }
    );
  }
 
}