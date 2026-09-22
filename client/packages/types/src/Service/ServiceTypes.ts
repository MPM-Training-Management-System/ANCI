export type ServiceRequestStatus =
  | "Pending"
  | "Approved"
  | "Rejected"
  | "Scheduled"
  | "InProgress"
  | "Completed"
  | "Cancelled";

export type ServiceRequestResolutionType =
  | "Training"
  | "Consultation"
  | "Other";

export interface ServiceRequirement {
  id: string;
  name: string;
  description?: string | null;
  isRequired: boolean;
  displayOrder: number;
}

export interface Service {
  id: string;
  serviceCode: string;
  name: string;
  description?: string | null;
  category: string;

  // Service image
  imageUrl?: string | null;

  requiresTraining: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;

  requirements: ServiceRequirement[];
}

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
  image?: File | null;
  requiresTraining: boolean;
  requirements: CreateServiceRequirement[];
}

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
  image?: File | null;
  removeImage?: boolean;
  requiresTraining: boolean;
  isActive: boolean;
  requirements: UpdateServiceRequirement[];
}

/**
 * Public service request
 */
export interface CreateServiceRequest {
  serviceId: string;
  applicantName: string;
  applicantEmail: string;
  remarks?: string | null;
}

export interface ServiceRequest {
  id: string;
  serviceId: string;
  serviceName?: string | null;

  userId?: string | null;

  applicantName: string;
  applicantEmail: string;

  remarks?: string | null;

  status: ServiceRequestStatus;

  resolutionType?: ServiceRequestResolutionType | null;
  adminRemarks?: string | null;

  requestedAt: string;
  reviewedAt?: string | null;
  reviewedByUserId?: string | null;
}

export interface ReviewServiceRequest {
  status: ServiceRequestStatus;
  resolutionType?: ServiceRequestResolutionType | null;
  adminRemarks?: string | null;
}

export type ServiceConsultationStatus =
  | "Scheduled"
  | "InProgress"
  | "Completed"
  | "Cancelled";

export interface CreateServiceConsultation {
  serviceRequestId: string;
  scheduledAt: string;
  meetingLink: string;
  notes?: string | null;
}

export interface UpdateServiceConsultation {
  scheduledAt: string;
  meetingLink: string;
  notes?: string | null;
  status: ServiceConsultationStatus;
}

export interface ServiceConsultation {
  id: string;
  serviceRequestId: string;
  serviceName?: string | null;
  applicantName: string;
  applicantEmail: string;
  scheduledAt: string;
  endedAt?: string | null;
  meetingLink: string;
  notes?: string | null;
  status: ServiceConsultationStatus;
  createdAt: string;
  updatedAt: string;
}