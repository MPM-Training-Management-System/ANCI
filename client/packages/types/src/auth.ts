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
  successs: boolean;
  user: MeUser;
}


