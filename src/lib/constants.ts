export const ROUTES = {
  home: "/",
  login: "/login",
  register: "/register",
  dashboard: "/dashboard",
  customers: "/customers",
  employees: "/employees",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  verifyEmail: "/verify-email",
  twoStepVerification: "/two-step-verification",
  forgotPasswordVerify: "/forgot-password-verify",
} as const

export type Route = (typeof ROUTES)[keyof typeof ROUTES]
