export const ParticipantEndpoints = {
  getMe: "/api/participant-profiles/me",

  listParticpant: "/api/User?role=Participant",

  byId: (id: number) => `/api/User/${id}`,

  create: "/api/participant/register",

  update: (id: number) => `/api/User/${id}`,

  delete: (id: number) => `/api/User/${id}`,
  
   status: (
    id: number,
    isActive: boolean
  ) =>
    `/api/User/${id}/status?isActive=${isActive}`,
} 