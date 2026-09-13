export type ServiceRequestStatus =
  | "Pending"
  | "Approved"
  | "Rejected"
  | "Scheduled"
  | "InProgress"
  | "Completed"
  | "Cancelled";

/* =========================
   SERVICE REQUIREMENT
========================= */

export interface ServiceRequirement {
  id: string;
  name: string;
  description?: string | null;
  isRequired: boolean;
  displayOrder: number;
}

/* =========================
   SERVICE
========================= */

export interface Service {
  id: string;
  serviceCode: string;
  name: string;
  description?: string | null;
  category: string;
  requiresTraining: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  requirements: ServiceRequirement[];
}

/* =========================
   CREATE SERVICE
========================= */

export interface CreateServiceRequirement {
  name: string;
  description?: string | null;
  isRequired: boolean;
  displayOrder: number;
}

export interface CreateService {
  serviceCode: string;
  name: string;
  description?: string | null;
  category: string;
  requiresTraining: boolean;
  requirements: CreateServiceRequirement[];
}

/* =========================
   UPDATE SERVICE
========================= */

export interface UpdateServiceRequirement {
  id?: string;
  name: string;
  description?: string | null;
  isRequired: boolean;
  displayOrder: number;
}

export interface UpdateService {
  name: string;
  description?: string | null;
  category: string;
  requiresTraining: boolean;
  isActive: boolean;
  requirements: UpdateServiceRequirement[];
}

/* =========================
   CREATE SERVICE REQUEST
========================= */

export interface CreateServiceRequest {
  serviceId: string;
  remarks?: string | null;
}

/* =========================
   SERVICE REQUEST
========================= */
export interface ServiceRequest {
  id: string;

  serviceId: string;
  serviceName?: string | null;

  userId: string;
  applicantName?: string | null;
  applicantEmail?: string | null;

  remarks?: string | null;

  status: ServiceRequestStatus;

  requestedAt: string;

  reviewedAt?: string | null;
  reviewedByUserId?: string | null;
}

/* =========================
   UPDATE REQUEST STATUS
========================= */

export interface UpdateServiceRequestStatus {
  status: ServiceRequestStatus;
  remarks?: string | null;
}