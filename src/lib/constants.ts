export const ROUTES = {
  home: "/",
  login: "/login",
  register: "/register",
  dashboard: "/dashboard",
} as const;

export type Route = (typeof ROUTES)[keyof typeof ROUTES];
