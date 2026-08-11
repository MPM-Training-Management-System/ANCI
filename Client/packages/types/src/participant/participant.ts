import { ApiClient } from "@repo/api";

export interface Participant {
  id: number;
  
  userId: string;
  username: string;
  fullname: string;
  email: string;
  profileImage: string;
  ValidId: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export type ValidIdFile = {
  uri: string;
  name: string;
  type: string;
  idType: string;
};

export interface RegisterParticipantRequest {
  email: string;
  profileImage?: string;
  validId?: ValidIdFile;


  FirstName: string;
  MiddleName?: string;
  LastName: string;

  DateOfBirth: string;

  Gender: string;
  CivilStatus: string;

  MobileNumber: string;


  HomeAddress: string;

  EmergencyContactName?: string;
  EmergencyRelationship?: string;
  EmergencyContactNumber?: string;
  
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

