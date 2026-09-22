export const CertificateEndpoints = {
  getAll: () => "/api/certificate/all",

  eligible: () => "/api/certificate/eligible",

  getByEnrollment: (enrollmentId: string) =>
    `/api/certificate/enrollment/${enrollmentId}`,

  generate: (enrollmentId: string) =>
    `/api/certificate/generate/${enrollmentId}`,

  verify: (verificationCode: string) =>
    `/api/certificate/verify/${verificationCode}`,
};