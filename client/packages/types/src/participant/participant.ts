
export interface ParticipantProfile {
  id: string;
  userId: string;
  userCode: string;

  // Account Information
  fullName: string;
  email: string;
  mobileNumber: string;

  role: string;
  status: string;

  // Personal Information
  firstName: string;
  middleName: string;
  lastName: string;
  birthDate: string | null;
  address: string;
  gender: string;
  profileImageUrl: string | null;

  // Educational Information
  highestEducationalAttainment: string | null;
  educationalStatus: string | null;
  schoolName: string | null;
  courseOrDegree: string | null;
  fieldOfStudy: string | null;
  yearGraduated: number | null;

  // Employment Information
  employmentStatus: string | null;
  companyName: string | null;
  jobTitle: string | null;
  industry: string | null;
  yearsOfWorkExperience: number | null;

  // Valid ID Information
  validIdType: string | null;
  validIdNumber: string | null;
  validIdImageUrl: string | null;
  validIdVerificationStatus: string | null;
  validIdRemarks: string | null;
  validIdVerifiedAt: string | null;
  validIdVerifiedBy: string | null;

  // Emergency Contact
  emergencyContactName: string | null;
  emergencyContactNumber: string | null;
  emergencyContactRelationship: string | null;
}

export interface UpdateParticipantProfile {
  firstName: string;
  middleName?: string;
  lastName: string;
  mobileNumber?: string;
  birthDate?: string;
  address?: string;
  gender?: string;

  // Educational Background
  highestEducationalAttainment?: string;
  educationalStatus?: string;
  schoolName?: string;
  courseOrDegree?: string;
  fieldOfStudy?: string;
  yearGraduated?: number | null;

  // Employment Information
  employmentStatus?: string;
  companyName?: string;
  jobTitle?: string;
  industry?: string;
  yearsOfWorkExperience?: number | null;

  // Emergency Contact
  emergencyContactName?: string;
  emergencyContactNumber?: string;
  emergencyContactRelationship?: string;
}


/**
 * Image selected from Expo ImagePicker.
 *
 * This is different from browser File.
 */
export interface ParticipantProfileImage {
  uri: string;
  name: string;
  type: string;
}

/**
 * Valid ID image selected from Expo ImagePicker.
 */
export interface ParticipantValidIdImage {
  uri: string;
  name: string;
  type: string;
}

/**
 * Valid ID upload request.
 */
export interface UpdateParticipantValidId {
  validIdType: string;
  validIdNumber: string | null;
  validIdImage: ParticipantValidIdImage;
}
