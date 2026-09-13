import { ApiClient } from "../api/client";
import { ServiceEndpoints } from "./ServiceEndpoints";

import type {
  CreateService,
  CreateServiceRequest,
  Service,
  ServiceRequest,
  UpdateService,
  UpdateServiceRequestStatus,
} from "@repo/types";

export class ServiceApi {
  constructor(
    private readonly api: ApiClient
  ) {}

  // =========================
  // SERVICES
  // =========================

  async getAll(): Promise<Service[]> {
    return this.api.request<Service[]>(
      ServiceEndpoints.getAll(),
      {
        method: "GET",
      }
    );
  }

  async getById(
    id: string
  ): Promise<Service> {
    return this.api.request<Service>(
      ServiceEndpoints.getById(id),
      {
        method: "GET",
      }
    );
  }

  async create(
    request: CreateService
  ): Promise<Service> {
    return this.api.request<Service>(
      ServiceEndpoints.create(),
      {
        method: "POST",
        body: request,
      }
    );
  }

  async update(
    id: string,
    request: UpdateService
  ): Promise<Service> {
    return this.api.request<Service>(
      ServiceEndpoints.update(id),
      {
        method: "PUT",
        body: request,
      }
    );
  }

  async delete(
    id: string
  ): Promise<void> {
    await this.api.request<void>(
      ServiceEndpoints.delete(id),
      {
        method: "DELETE",
      }
    );
  }

  // =========================
  // SERVICE REQUESTS
  // =========================

  async createRequest(
    request: CreateServiceRequest
  ): Promise<ServiceRequest> {
    return this.api.request<ServiceRequest>(
      ServiceEndpoints.createRequest(),
      {
        method: "POST",
        body: request,
      }
    );
  }

  async getRequests(): Promise<ServiceRequest[]> {
    return this.api.request<ServiceRequest[]>(
      ServiceEndpoints.getRequests(),
      {
        method: "GET",
      }
    );
  }

  async getRequestById(
    id: string
  ): Promise<ServiceRequest> {
    return this.api.request<ServiceRequest>(
      ServiceEndpoints.getRequestById(id),
      {
        method: "GET",
      }
    );
  }

  async updateRequestStatus(
    id: string,
    request: UpdateServiceRequestStatus
  ): Promise<ServiceRequest> {
    return this.api.request<ServiceRequest>(
      ServiceEndpoints.updateRequestStatus(id),
      {
        method: "PUT",
        body: request,
      }
    );
  }
}