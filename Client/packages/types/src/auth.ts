export interface LoginRequest {
  login: string;
  password: string;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
}

export interface LoginResponse {
  token: string;
  refreshToken?: string;
  user: User;
}