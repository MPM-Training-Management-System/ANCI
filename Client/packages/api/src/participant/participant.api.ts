import { ApiClient } from "../api/client";
import { ParticipantEndpoints } from "./participant.endpoints";

import type {
  ParticipantProfile
} from "@repo/types";

export class ParticipantApi {
  constructor(private api: ApiClient) {}



  async getMe():
  Promise<ParticipantProfile> {
    return this.api.request<ParticipantProfile>(
      ParticipantEndpoints.getMe,
      {
        method: "GET",
      }
    );
  }
 
}