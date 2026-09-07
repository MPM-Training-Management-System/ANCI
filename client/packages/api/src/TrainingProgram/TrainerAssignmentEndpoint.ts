export const TrainerAssignmentEndpoints = {
  // ==========================================
  // GET ALL TRAINER ASSIGNMENTS
  // GET /api/trainer-assignments
  // ==========================================

  getAll: "/api/trainer-assignments",

  // ==========================================
  // GET MY TRAINER ASSIGNMENTS
  // GET /api/trainer-assignments/me
  // ==========================================

  me: "/api/trainer-assignments/me",

  // ==========================================
  // CREATE TRAINER ASSIGNMENT
  // POST /api/trainer-assignments
  // ==========================================

  create: "/api/trainer-assignments",

  // ==========================================
  // DELETE TRAINER ASSIGNMENT
  // DELETE /api/trainer-assignments/{id}
  // ==========================================

  byId: (id: string) =>
    `/api/trainer-assignments/${id}`,
};