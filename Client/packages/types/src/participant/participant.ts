export interface Participant {
  id: number;
  userId: string;
  username: string;
  fullname: string;
  email: string;
  profileImage: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export interface CreateParticipantRequest {
  username: string;
  fullName: string;
  email: string;
  password: string;
}

export interface UpdateParticipantRequest {
  username: string;
  fullName: string;
  email: string;
}

export interface ParticipantFilter {
  search?: string;
  page?: number;
  pageSize?: number;
}