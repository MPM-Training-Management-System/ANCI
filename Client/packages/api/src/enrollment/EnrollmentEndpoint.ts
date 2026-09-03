

export const EnrollmentEndpoints = {


  // PARTICIPANT


  create:
    "/api/enrollments",


  // PARTICIPANT
  

  myEnrollments:
    "/api/enrollments/me",




  byId: (id: string) =>
    `/api/enrollments/${id}`,

 
  // ADMIN

  getAllForAdmin:
    "/api/enrollments/admin",


  review: (id: string) =>
    `/api/enrollments/${id}/review`,

} as const;



export const EnrollmentDocumentEndpoints = {

  // PARTICIPANT
  

  upload: (enrollmentId: string) =>
    `/api/enrollments/${enrollmentId}/documents`,



  getAll: (enrollmentId: string) =>
    `/api/enrollments/${enrollmentId}/documents`,

 

  delete: (
    enrollmentId: string,
    documentId: string
  ) =>
    `/api/enrollments/${enrollmentId}/documents/${documentId}`,

  
  // ADMIN

 getAllForAdmin: (enrollmentId: string) =>
    `/api/enrollments/${enrollmentId}/documents/admin`,
  review: (
    enrollmentId: string,
    documentId: string
  ) =>
    `/api/enrollments/${enrollmentId}/documents/${documentId}/review`,

} as const;