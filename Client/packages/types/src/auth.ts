export interface RegisterRequest{
  fullName: string;
  email: string;
  mobileNumber: string;
  password: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
}