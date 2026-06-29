export interface User {
  id: string;
  email: string;
  name: string;
  role: "user" | "admin";
  createdAt: string;
}

export interface Session {
  userId: string;
  email: string;
  role?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
