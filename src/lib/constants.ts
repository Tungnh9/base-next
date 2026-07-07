export const ROUTES = {
  home: "/",
  login: "/login",
  register: "/register",
  dashboard: "/dashboard",
  analytics: "/analytics",
  calendar: "/calendar",
} as const

export type Route = (typeof ROUTES)[keyof typeof ROUTES]
