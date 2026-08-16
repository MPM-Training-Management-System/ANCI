import { ApiClient } from "../api/client";

import {
  UserApplicationEndpoints,
} from "./user.endpoint";

import type {
  UserApplicationResponse,
  UserApplicationDetails,
  RejectUserApplicationRequest,
} from "@repo/types";

export class UserApplicationApi {
  constructor(
    private api: ApiClient
  ) {}

  // =====================================================
  // GET PENDING APPLICATIONS
  //
  // Returns:
  // Participant + Trainer
  // =====================================================

  getPending() {
    return this.api.request<
      UserApplicationResponse[]
    >(
      UserApplicationEndpoints.pending,
      {
        method: "GET",
      }
    );
  }

  // =====================================================
  // GET APPLICATION DETAILS
  //
  // Returns:
  // Participant OR Trainer
  // =====================================================

  getById(id: string) {
    return this.api.request<
      UserApplicationDetails
    >(
      UserApplicationEndpoints.byId(id),
      {
        method: "GET",
      }
    );
  }

  // =====================================================
  // APPROVE
  //
  // Participant OR Trainer
  // =====================================================

  approve(id: string) {
    return this.api.request<{
      message: string;
    }>(
      UserApplicationEndpoints.approve(id),
      {
        method: "PATCH",
      }
    );
  }

  // =====================================================
  // REJECT
  //
  // Participant OR Trainer
  // =====================================================

  reject(
    id: string,
    reason: string
  ) {
    const body: RejectUserApplicationRequest =
      {
        reason,
      };

    return this.api.request<{
      message: string;
    }>(
      UserApplicationEndpoints.reject(id),
      {
        method: "PATCH",
        body: JSON.stringify(body),
        headers: {
          "Content-Type":
            "application/json",
        },
      }
    );
  }
}