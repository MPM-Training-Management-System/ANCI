export const ParticipantEndpoints = {
  list: "/api/User",

  listParticpant: "/api/User?role=Participant",

  byId: (id: number) => `/api/User/${id}`,

  create: "/api/Auth/register",

  update: (id: number) => `/api/User/${id}`,

  delete: (id: number) => `/api/User/${id}`,
} 