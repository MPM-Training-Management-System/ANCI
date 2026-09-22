export const ParticipationEndpoints = {
  // ADMIN - PARTICIPATION SETTING

  getSetting: (trainingBatchId: string) =>
    `/api/participation/setting/${trainingBatchId}`,

  saveSetting: (trainingBatchId: string) =>
    `/api/participation/setting/${trainingBatchId}`,

  // TRAINER - SESSION PARTICIPANTS

  getSessionParticipants: (trainingSessionId: string) =>
    `/api/participation/session/${trainingSessionId}`,

  // TRAINER - RECITATION

  record: () =>
    `/api/participation/record`,

  remove: (id: string) =>
    `/api/participation/record/${id}`,

  // PARTICIPANT - PROGRESS

  getProgress: (enrollmentId: string) =>
    `/api/participation/progress/${enrollmentId}`,
};