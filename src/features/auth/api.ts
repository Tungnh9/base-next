import { serverApi } from "@/lib/api";
import type { User, LoginCredentials, AuthResponse } from "./types";

export const authApi = {
  login: (credentials: LoginCredentials) =>
    serverApi<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),

  me: () => serverApi<User>("/auth/me"),

  logout: () =>
    serverApi<void>("/auth/logout", { method: "POST" }),
};
