import { ApiClient } from "../api/client";
import { ParticipantApplicationEndpoints } from "./participantApplication.endpoints";

import type {
  ParticipantApplication,
  ParticipantApplicationDetails,
  RejectApplicationRequest,
} from "@repo/types";

export class ParticipantApplicationApi {
  constructor(private api: ApiClient) {}

  // =====================================================
  // GET PENDING APPLICATIONS
  // =====================================================

  getPending() {
    return this.api.request<ParticipantApplication[]>(
      ParticipantApplicationEndpoints.pending
    );
  }

  // =====================================================
  // GET APPLICATION DETAILS
  // =====================================================

  getById(id: string) {
    return this.api.request<ParticipantApplicationDetails>(
      ParticipantApplicationEndpoints.byId(id)
    );
  }

  // =====================================================
  // APPROVE APPLICATION
  // =====================================================

  approve(id: string) {
    return this.api.request<{ message: string }>(
      ParticipantApplicationEndpoints.approve(id),
      {
        method: "PATCH",
      }
    );
  }

  // =====================================================
  // REJECT APPLICATION
  // =====================================================

  reject(
    id: string,
    reason: string
  ) {
    const data: RejectApplicationRequest = {
      reason,
    };

    return this.api.request<{ message: string }>(
      ParticipantApplicationEndpoints.reject(id),
      {
        method: "PATCH",
        body: JSON.stringify(data),
      }
    );
  }
}