import { serverApi } from "@/lib/api"
import type { User, AuthResponse } from "./types"
import type { LoginInput, RegisterInput } from "./schemas"

export const authApi = {
  login: (credentials: LoginInput) =>
    serverApi<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),

  register: (credentials: RegisterInput) =>
    serverApi<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),

  me: () => serverApi<User>("/auth/me"),

  logout: () => serverApi<void>("/auth/logout", { method: "POST" }),
}
