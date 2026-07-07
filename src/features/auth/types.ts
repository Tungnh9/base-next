export interface User {
  id: string
  email: string
  name: string
  role: "user" | "admin"
  createdAt: string
}

export interface Session {
  userId: string
  email: string
  role?: string
}

export interface AuthResponse {
  token: string
  user: User
}
