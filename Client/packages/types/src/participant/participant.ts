export interface Participant {
  id: number;
  username: string;
  fullName: string;
  email: string;
  create_at: string;
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