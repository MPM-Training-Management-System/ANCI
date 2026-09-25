// =========================================================
// TRAINER APPLICATION STATUS
// =========================================================

export type TrainerApplicationStatus =
  | "Pending"
  | "UnderReview"
  | "NeedsCorrection"
  | "Approved"
  | "Rejected";


// =========================================================
// TRAINER APPLICATION DOCUMENT STATUS
// =========================================================

export type TrainerApplicationDocumentStatus =
  | "Pending"
  | "Approved"
  | "Rejected"
  | "NeedsCorrection";


// =========================================================
// TRAINER APPLICATION DOCUMENT
// =========================================================

export interface TrainerApplicationDocument {
  id: string;
  trainerApplicationId: string;

  documentType: string;
  fileName: string;
  fileUrl: string;

  status: TrainerApplicationDocumentStatus;

  reviewRemarks?: string | null;
  reviewedByUserId?: string | null;
  reviewedAt?: string | null;

  uploadedAt: string;
}


// =========================================================
// TRAINER EDUCATION
// =========================================================

export interface TrainerEducation {
  id: string;
  trainerProfileId: string;

  degree: string;
  fieldOfStudy: string | null;
  institution: string;
  yearGraduated: number | null;
}


// =========================================================
// TRAINER CERTIFICATION
// =========================================================

export interface TrainerCertification {
  id: string;
  trainerProfileId: string;

  name: string;
  issuingOrganization: string | null;
  issuedDate: string | null;
  expirationDate: string | null;
  certificateUrl: string | null;
}


// =========================================================
// TRAINER APPLICATION EDUCATION
// =========================================================

export interface TrainerApplicationEducation {
  id: string;
  trainerApplicationId: string;

  degree: string;
  fieldOfStudy: string | null;
  institution: string;
  yearGraduated: number | null;
}


// =========================================================
// TRAINER APPLICATION CERTIFICATION
// =========================================================

export interface TrainerApplicationCertification {
  id: string;
  trainerApplicationId: string;

  name: string;
  issuingOrganization: string | null;
  issuedDate: string | null;
  expirationDate: string | null;
  certificateUrl: string | null;
}


// =========================================================
// CREATE TRAINER EDUCATION
// =========================================================

export interface CreateTrainerEducationRequest {
  degree: string;
  fieldOfStudy?: string | null;
  institution: string;
  yearGraduated?: number | null;
}


// =========================================================
// CREATE TRAINER CERTIFICATION
// =========================================================

export interface CreateTrainerCertificationRequest {
  name: string;
  issuingOrganization?: string | null;
  issuedDate?: string | null;
  expirationDate?: string | null;
  certificateUrl?: string | null;
}


// =========================================================
// TRAINER APPLICATION
// =========================================================

export interface TrainerApplication {
  id: string;
  userId: string;

  userCode: string;
  fullName: string;
  email: string;
  mobileNumber: string | null;

  // -------------------------------------------------------
  // Personal Information
  // -------------------------------------------------------

  firstName: string | null;
  middleName: string | null;
  lastName: string | null;
  suffix: string | null;

  birthDate: string | null;
  gender: string | null;
  address: string | null;

  // -------------------------------------------------------
  // Professional Information
  // -------------------------------------------------------

  specialization: string;
  professionalTitle: string | null;
  currentOrganization: string | null;
  bio: string | null;
  yearsOfExperience: number | null;

  // -------------------------------------------------------
  // Professional License
  // -------------------------------------------------------

  professionalLicenseNumber: string | null;
  professionalLicenseType: string | null;
  professionalLicenseExpirationDate: string | null;

  // -------------------------------------------------------
  // Profile
  // -------------------------------------------------------

  profileImageUrl: string | null;

  // -------------------------------------------------------
  // Application Status
  // -------------------------------------------------------

  status: TrainerApplicationStatus;

  adminRemarks: string | null;

  createdAt: string;
  submittedAt: string | null;

  // -------------------------------------------------------
  // Related Records
  // -------------------------------------------------------

  educations: TrainerApplicationEducation[];
  certifications: TrainerApplicationCertification[];
  documents: TrainerApplicationDocument[];
}


// =========================================================
// REVIEW TRAINER APPLICATION
// =========================================================

export interface ReviewTrainerApplicationRequest {
  decision:
    | "Approved"
    | "Rejected"
    | "NeedsCorrection";

  remarks?: string | null;
}


// =========================================================
// REVIEW TRAINER APPLICATION DOCUMENT
// =========================================================

export interface ReviewTrainerApplicationDocumentRequest {
  decision:
    | "Approved"
    | "Rejected"
    | "NeedsCorrection";

  remarks?: string | null;
}


// =========================================================
// UPDATE TRAINER APPLICATION
// =========================================================

export interface UpdateTrainerApplicationRequest {
  firstName?: string | null;
  middleName?: string | null;
  lastName?: string | null;
  suffix?: string | null;

  birthDate?: string | null;
  gender?: string | null;
  address?: string | null;

  specialization?: string | null;
  professionalTitle?: string | null;
  currentOrganization?: string | null;
  bio?: string | null;
  yearsOfExperience?: number | null;

  professionalLicenseNumber?: string | null;
  professionalLicenseType?: string | null;
  professionalLicenseExpirationDate?: string | null;
}


// =========================================================
// UPDATE TRAINER PROFILE
// =========================================================

export interface UpdateTrainerProfileRequest {
  firstName?: string | null;
  middleName?: string | null;
  lastName?: string | null;
  suffix?: string | null;

  birthDate?: string | null;
  address?: string | null;
  gender?: string | null;
  mobileNumber?: string | null;

  specialization?: string | null;
  professionalTitle?: string | null;
  currentOrganization?: string | null;
  bio?: string | null;
  yearsOfExperience?: number | null;

  professionalLicenseNumber?: string | null;
  professionalLicenseType?: string | null;
  professionalLicenseExpirationDate?: string | null;
}


// =========================================================
// TRAINER PROFILE
// =========================================================

export interface TrainerProfile {
  id: string;
  userId: string;

  userCode: string;
  fullName: string;
  email: string;
  mobileNumber: string | null;

  // -------------------------------------------------------
  // Personal Information
  // -------------------------------------------------------

  firstName: string | null;
  middleName: string | null;
  lastName: string | null;
  suffix: string | null;

  birthDate: string | null;
  address: string | null;
  gender: string | null;

  // -------------------------------------------------------
  // Professional Information
  // -------------------------------------------------------

  specialization: string | null;
  professionalTitle: string | null;
  currentOrganization: string | null;
  bio: string | null;
  yearsOfExperience: number | null;

  // -------------------------------------------------------
  // Professional License
  // -------------------------------------------------------

  professionalLicenseNumber: string | null;
  professionalLicenseType: string | null;
  professionalLicenseExpirationDate: string | null;

  // -------------------------------------------------------
  // Account / Status
  // -------------------------------------------------------

  isActive: boolean;
  activatedAt: string | null;

  // -------------------------------------------------------
  // Profile Image
  // -------------------------------------------------------

  profileImageUrl: string | null;

  // -------------------------------------------------------
  // Related Records
  // -------------------------------------------------------

  educations: TrainerEducation[];
  certifications: TrainerCertification[];
}


// =========================================================
// PARTICIPANT REGISTRATION
// =========================================================

export interface RegisterRequest {
  fullName?: string;

  firstName: string;
  middleName: string;
  lastName: string;

  email: string;
  mobileNumber: string;

  birthDate: string;
  address: string;
  gender: string;

  profileImage?: {
    uri: string;
    name: string;
    type: string;
  };

  password: string;
}


// =========================================================
// PARTICIPANT REGISTRATION RESPONSE
// =========================================================

export interface RegisterResponse {
  success: boolean;
  message: string;
}


// =========================================================
// OTP
// =========================================================

export interface VerifyOtpRequest {
  email: string;
  otpCode: string;
}

export interface SendOtpRequest {
  email: string;
}

export interface OtpResponse {
  success: boolean;
  message: string;
}


// =========================================================
// LOGIN
// =========================================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginUser {
  id: string;
  email: string;
  fullName: string;
  role: string;
  status: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  user: LoginUser;
}


// =========================================================
// FORGOT PASSWORD
// =========================================================

export interface ForgotPasswordRequest {
  email: string;
}


// =========================================================
// VERIFY PASSWORD RESET OTP
// =========================================================

export interface VerifyResetOtpRequest {
  email: string;
  otpCode: string;
}


// =========================================================
// RESET PASSWORD
// =========================================================

export interface ResetPasswordRequest {
  email: string;
  otpCode: string;
  newPassword: string;
  confirmPassword: string;
}


// =========================================================
// CHANGE PASSWORD
// =========================================================

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}


// =========================================================
// CURRENT AUTHENTICATED USER
// =========================================================

export interface MeUser {
  id: string;
  email: string;
  fullName: string;
  status: string;
  profileImage: string | null;
}

export interface MeResponse {
  success: boolean;
  user: MeUser;
}


// =========================================================
// TRAINER REGISTRATION
// =========================================================

export interface RegisterTrainerRequest {
  // -------------------------------------------------------
  // Personal Information
  // -------------------------------------------------------

  FirstName: string;
  MiddleName?: string | null;
  LastName: string;
  Suffix?: string | null;

  BirthDate?: string | null;
  Address: string;
  Gender: string;

  // -------------------------------------------------------
  // Account Information
  // -------------------------------------------------------

  Email: string;
  MobileNumber?: string | null;
  Password: string;

  // -------------------------------------------------------
  // Professional Information
  // -------------------------------------------------------

  Specialization: string;
  ProfessionalTitle?: string | null;
  CurrentOrganization?: string | null;
  Bio?: string | null;
  YearsOfExperience?: number | null;

  // -------------------------------------------------------
  // Professional License
  // -------------------------------------------------------

  ProfessionalLicenseNumber?: string | null;
  ProfessionalLicenseType?: string | null;
  ProfessionalLicenseExpirationDate?: string | null;

  // -------------------------------------------------------
  // Profile Image
  // -------------------------------------------------------

  ProfileImage?: File | null;

  // -------------------------------------------------------
  // Education
  // -------------------------------------------------------

  Educations: CreateTrainerEducationRequest[];

  // -------------------------------------------------------
  // Certifications
  // -------------------------------------------------------

  Certifications: CreateTrainerCertificationRequest[];
}