export const AuthEndpoints = {
  // ==========================================
  // AUTHENTICATION
  // ==========================================

  login: () => `/api/auth/login`,

  register: () => `/api/auth/register`,

  registerTrainer: () => `/api/auth/register/trainer`,

  // ==========================================
  // EMAIL VERIFICATION
  // ==========================================

  sendOtp: () => `/api/auth/send-otp`,

  verifyOtp: () => `/api/auth/verify-otp`,

  // ==========================================
  // FORGOT PASSWORD
  // ==========================================

  forgotPassword: () => `/api/auth/forgot-password`,

  verifyResetOtp: () => `/api/auth/verify-reset-otp`,

  resetPassword: () => `/api/auth/reset-password`,

  // ==========================================
  // CHANGE PASSWORD
  // ==========================================

  changePassword: () => `/api/auth/change-password`,

  // ==========================================
  // CURRENT USER
  // ==========================================

  me: () => `/api/auth/me`,
};