export const ParticipantEndpoints = {
  list: "/api/User?role=Participant",

  byId: (id: number) => `/api/User/${id}`,

  create: "/api/User",

  update: (id: number) => `/api/User/${id}`,

  delete: (id: number) => `/api/User/${id}`,
} as const;