export interface RegisterTrainerForm {
  profileImage?: File;

  // Personal
  firstName: string;
  middleName?: string;
  lastName: string;

  dateOfBirth: string;
  gender: string;
  civilStatus: string;

  mobileNumber: string;
  homeAddress: string;

  // Account
  email: string;
  username: string;
  password: string;
  confirmPassword: string;

  // Professional
  expertise: string;
  yearsOfExperience: number;
  organization: string;
  biography: string;
}