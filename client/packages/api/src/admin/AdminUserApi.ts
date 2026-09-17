import { ApiClient } from "../api/client";
import { AdminUserEndpoints } from "./AdminUserEndpoints";

import type {
  AdminUserDetails,
  AdminUserList,
  UpdateAdminUserRequest,
  UpdateAdminUserStatusRequest,
} from "@repo/types";

export class AdminUserApi {
  constructor(private readonly api: ApiClient) {}

  // ==========================================
  // ADMIN USERS
  // ==========================================

  /**
   * Admin - get all Participant and Trainer users
   */
  async getAll(): Promise<AdminUserList[]> {
    return this.api.request<AdminUserList[]>(
      AdminUserEndpoints.getAll(),
      {
        method: "GET",
      }
    );
  }

  /**
   * Admin - get a specific user
   */
  async getById(id: string): Promise<AdminUserDetails> {
    return this.api.request<AdminUserDetails>(
      AdminUserEndpoints.getById(id),
      {
        method: "GET",
      }
    );
  }

  /**
   * Admin - update user and role-specific profile
   */
  async update(
    id: string,
    request: UpdateAdminUserRequest
  ): Promise<AdminUserDetails> {
    return this.api.request<AdminUserDetails>(
      AdminUserEndpoints.update(id),
      {
        method: "PUT",
        body: request,
      }
    );
  }

  /**
   * Admin - update user status
   */
  async updateStatus(
    id: string,
    request: UpdateAdminUserStatusRequest
  ): Promise<AdminUserDetails> {
    return this.api.request<AdminUserDetails>(
      AdminUserEndpoints.updateStatus(id),
      {
        method: "PATCH",
        body: request,
      }
    );
  }

  /**
   * Admin - delete user
   */
  async delete(id: string): Promise<void> {
    await this.api.request<void>(
      AdminUserEndpoints.delete(id),
      {
        method: "DELETE",
      }
    );
  }
}