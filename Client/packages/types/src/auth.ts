export interface LoginRequest {
  email: string;
  password: string;
}

export interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: string;
}

export interface LoginResponse {
  token: string;
  refreshToken?: string;
  user: User;
}