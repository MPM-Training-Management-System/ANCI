export const AdminUserEndpoints = {
    
  getAll: () => `/api/admin/users`,

  getById: (id: string) =>
    `/api/admin/users/${id}`,

  update: (id: string) =>
    `/api/admin/users/${id}`,

  updateStatus: (id: string) =>
    `/api/admin/users/${id}/status`,

  delete: (id: string) =>
    `/api/admin/users/${id}`,
};