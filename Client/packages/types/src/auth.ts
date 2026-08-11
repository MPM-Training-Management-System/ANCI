export interface LoginRequest {
  login: string;
  password: string;
}

export interface User {
  id: string;
  userId: string;
  username: string;
  fullName: string;
  email: string;
  role: string;
  isActive: boolean;
  isEmailVerified: boolean;
}
export interface LoginResponse {
  token: string;
  refreshToken?: string;
  user: User;
}