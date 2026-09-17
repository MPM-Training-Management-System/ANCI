import { ApiClient } from "../api/client";
import { ServiceEndpoints } from "./ServiceEndpoints";

import type {
  CreateService,
  CreateServiceRequest,
  CreateServiceConsultation,
  ReviewServiceRequest,
  Service,
  ServiceConsultation,
  ServiceRequest,
  UpdateService,
  UpdateServiceConsultation,
} from "@repo/types";

export class ServiceApi {
  constructor(private readonly api: ApiClient) {}

  // ==========================================
  // SERVICES
  // ==========================================

  async getAll(): Promise<Service[]> {
    return this.api.request<Service[]>(
      ServiceEndpoints.getAll(),
      {
        method: "GET",
      }
    );
  }

  async getById(id: string): Promise<Service> {
    return this.api.request<Service>(
      ServiceEndpoints.getById(id),
      {
        method: "GET",
      }
    );
  }

  async create(request: CreateService): Promise<Service> {
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

  async delete(id: string): Promise<void> {
    await this.api.request<void>(
      ServiceEndpoints.delete(id),
      {
        method: "DELETE",
      }
    );
  }

  // ==========================================
  // SERVICE REQUESTS
  // ==========================================

  /**
   * Public visitor / logged-in user
   *
   * Sends:
   * - serviceId
   * - applicantName
   * - applicantEmail
   * - remarks
   */
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

  async getConsultations(): Promise<ServiceConsultation[]> {
  return this.api.request<ServiceConsultation[]>(
    ServiceEndpoints.getConsultations(),
    {
      method: "GET",
    },
  );
}

async getConsultationById(
  id: string,
): Promise<ServiceConsultation> {
  return this.api.request<ServiceConsultation>(
    ServiceEndpoints.getConsultationById(id),
    {
      method: "GET",
    },
  );
}

async createConsultation(
  consultation: CreateServiceConsultation,
): Promise<ServiceConsultation> {
  return this.api.request<ServiceConsultation>(
    ServiceEndpoints.createConsultation(),
    {
      method: "POST",
      body: consultation,
    },
  );
}

async updateConsultation(
  id: string,
  consultation: UpdateServiceConsultation,
): Promise<ServiceConsultation> {
  return this.api.request<ServiceConsultation>(
    ServiceEndpoints.updateConsultation(id),
    {
      method: "PUT",
      body: consultation,
    },
  );
}

  /**
   * Admin - get all service requests
   */
  async getRequests(): Promise<ServiceRequest[]> {
    return this.api.request<ServiceRequest[]>(
      ServiceEndpoints.getRequests(),
      {
        method: "GET",
      }
    );
  }

  /**
   * Admin - get a specific service request
   */
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
async reviewRequest(
  id: string,
  request: ReviewServiceRequest,
): Promise<ServiceRequest> {
  return this.api.request<ServiceRequest>(  
    ServiceEndpoints.reviewRequest(id),
    {
      method: "PUT",
      body: request,
    },
  );
}
}