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

export interface VerifyOtpRequest {
  email: string;
  otpCode: string;
}
export interface SendOtpRequest{
  email: string;
}
export interface OtpResponse {
  success: boolean;
  message: string;
}