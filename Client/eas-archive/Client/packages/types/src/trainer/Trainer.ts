export interface RegisterTrainerForm {
  firstName: string;
  middleName?: string;
  lastName: string;

  dateOfBirth: string;
  gender: string;
  civilStatus: string;

  mobileNumber: string;
  homeAddress: string;

  expertise: string;
  yearsOfExperience: number;
  organization: string;
  biography: string;

  profileImage?: File;
  validId?: File;
  validIdType?: string;
}

export interface TrainerResponseDTO {


  id: string;



  userId: string;
  userIdNumber?: string;

  username: string;
  email: string;
  role: string;

  isActive: boolean;
  isEmailVerified: boolean;

 

  firstName: string;
  middleName?: string | null;
  lastName: string;
  fullName?: string | null;

  dateOfBirth: string;
  gender: string;
  civilStatus: string;

  mobileNumber: string;
  homeAddress: string;

  expertise: string;
  yearsOfExperience: number;
  organization: string;
  biography: string;

  

  profileImage?: string | null;
  validId?: string | null;


  isProfileCompleted: boolean;

  applicationStatus?: number;
  policyStatus?: number;

  policyRemarks?: string | null;

  submittedAt?: string | null;


  createdAt: string;
}


export interface TrainerApplicationResponse {
  id: string;
  userId: string;

  username: string;
  email: string;

  firstName: string;
  middleName: string | null;
  lastName: string;
  fullName: string;

  dateOfBirth: string;
  gender: string;
  civilStatus: string;

  mobileNumber: string;
  homeAddress: string;

  expertise: string;
  yearsOfExperience: number;
  organization: string;
  biography: string;

  profileImage: string | null;
  validId: string | null;

  isProfileCompleted: boolean;
  isActive: boolean;
  isEmailVerified: boolean;

  applicationStatus: number;
  policyStatus: number;
  policyRemarks: string | null;

  submittedAt: string;
  createdAt: string;
}

export interface TrainerApplicationDetails {
  id: string;
  userId: string;
  userIdNumber: string;

  username: string;
  email: string;

  firstName: string;
  middleName: string | null;
  lastName: string;
  fullName: string;

  dateOfBirth: string;
  gender: string;
  civilStatus: string;

  mobileNumber: string;
  homeAddress: string;

  expertise: string;
  yearsOfExperience: number;
  organization: string;
  biography: string;

  profileImage: string | null;
  validId: string | null;

  role: string;

  isProfileCompleted: boolean;
  isActive: boolean;
  isEmailVerified: boolean;

  status:
    | "Pending"
    | "Approved"
    | "Rejected";

  policyStatus:
    | "Pending"
    | "Passed"
    | "Failed";

  policyRemarks: string | null;

  submittedAt: string;
  createdAt: string;

  reviewedBy: string | null;
  reviewedAt: string | null;
  rejectionReason: string | null;

  emergencyContactName: string | null;
  emergencyRelationship: string | null;
  emergencyContactNumber: string | null;
}