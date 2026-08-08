import { ApiClient } from "@repo/api";

export interface Participant {
  id: number;
  userId: string;
  username: string;
  fullname: string;
  email: string;
  profileImage: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export interface RegisterParticipantRequest {
  profileImage?: File;

  FirstName: string;
  MiddleName?: string;
  LastName: string;

  DateOfBirth: string;

  Gender: string;
  CivilStatus: string;

  MobileNumber: string;
  Email: string;
  Username: string;

  HomeAddress: string;

  EmergencyContactName?: string;
  EmergencyRelationship?: string;
  EmergencyContactNumber?: string;

  Password: string;
}

export interface RegisterParticipantResponse {
  success: boolean;
  message: string;
}
export interface UpdateParticipantRequest {
  username: string;
  fullName: string;
  email: string;
}

export interface ParticipantFilter {
  search?: string;
  page?: number;
  pageSize?: number;
}

