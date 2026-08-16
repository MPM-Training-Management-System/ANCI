import { User } from "../auth";

/* =========================================================
   PARTICIPANT USER
   Used by DataTable
========================================================= */

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

/* =========================================================
   VALID ID FILE
========================================================= */

export type ValidIdFile = {
  uri: string;
  name: string;
  type: string;
  idType: string;
};

/* =========================================================
   REGISTER
========================================================= */

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

/* =========================================================
   REGISTER RESPONSE
========================================================= */

export interface RegisterParticipantResponse {
  success: boolean;

  message: string;

  token: string;

  refreshToken?: string;

  user: User;
}

/* =========================================================
   UPDATE
========================================================= */

export interface UpdateParticipantRequest {
  username: string;

  fullName: string;

  email: string;
}

/* =========================================================
   FILTER
========================================================= */

export interface ParticipantFilter {
  search?: string;

  page?: number;

  pageSize?: number;
}

/* =========================================================
   APPLICATION STATUS
========================================================= */

export type ApplicationStatus =
  | "Pending"
  | "Approved"
  | "Rejected";

/* =========================================================
   POLICY STATUS
========================================================= */

export type PolicyStatus =
  | "Pending"
  | "Passed"
  | "Failed";

/* =========================================================
   PARTICIPANT APPLICATION
   Used by Pending Approvals
========================================================= */

export interface ParticipantApplication {
  id: string;

  userId: string;

  firstName: string;

  middleName?: string | null;

  lastName: string;

  email: string;

  username?: string | null;

  profileImage?: string | null;

  status: ApplicationStatus;

  policyStatus: PolicyStatus;

  policyRemarks?: string | null;

  reviewedBy?: string | null;

  reviewedAt?: string | null;

  rejectionReason?: string | null;

  submittedAt: string;
}

/* =========================================================
   PARTICIPANT APPLICATION DETAILS
   Used by ApplicationDetailsModal
========================================================= */

export interface ParticipantApplicationDetails {
  id: string;

  userId: string;

  status: ApplicationStatus;

  policyStatus: PolicyStatus;

  policyRemarks?: string | null;

  reviewedBy?: string | null;

  reviewedAt?: string | null;

  rejectionReason?: string | null;

  submittedAt: string;

  userIdNumber: string;

  username: string;

  email: string;

  role: string;

  isActive: boolean;

  isEmailVerified: boolean;

  firstName: string;

  middleName?: string | null;

  lastName: string;

  dateOfBirth: string;

  gender: string;

  civilStatus: string;

  mobileNumber: string;

  homeAddress: string;

  emergencyContactName?: string | null;

  emergencyRelationship?: string | null;

  emergencyContactNumber?: string | null;

  profileImage?: string | null;

  validId?: string | null;
}