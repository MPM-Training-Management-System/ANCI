import { ApiClient } from "../api/client";
import { ParticipantEndpoints } from "./participant.endpoints";

import type {
  ParticipantProfile
} from "@repo/types";

export class ParticipantApi {
  constructor(private api: ApiClient) {}



  getAll() {
    return this.api.request<ParticipantProfile>(
      ParticipantEndpoints.getMe
    );
  }
 
}