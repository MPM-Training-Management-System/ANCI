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

export interface LoginRequest{
  email: string;
  password: string;
}

export interface LoginUser{
  id: string;
  email: string;
  fullName: string;
  role: string;
  status: string;
}

export interface LoginResponse{
  success: boolean;
  message: string;
  token: string;
  user: LoginUser;

}

export interface MeUser{
  id: string;
  email: string;
  fullName: string;
  status: string;
  profileImage: string | null;
}

export interface MeResponse{
  successs: boolean;
  user: MeUser;
}
