

export interface RegisterTrainerRequest {
  fullName: string;
  firstName: string;
  middleName: string;
  lastName: string;
  birthDate: string;
  address: string;
  gender: string;
  email: string;
  mobileNumber?: string;
  password: string;

  specialization: string;

  yearsOfExperience?: number;

  certificationName?: string;

  certificationNumber?: string;

 profileImage?: File;
}

export interface TrainerProfile {
  id: string;

  userId: string;

  userCode: string;

  firstName: string;

  middleName: string;

  lastName: string;

  birthDate: string;

  address: string;

  gender: string;

  fullName: string;

  email: string;

  mobileNumber: string | null;

  specialization: string;

  bio: string | null;

  yearsOfExperience: number | null;

  profileImageUrl: string | null;

  isActive: boolean;

  activatedAt: string | null;
}


