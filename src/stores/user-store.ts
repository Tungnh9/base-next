"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { User } from "@/features/auth/types"

interface UserState {
  user: User | null
  setUser: (user: User) => void
  clearUser: () => void
}

// Display-only cache of the logged-in user — NOT the source of truth for auth.
// Session validity is always determined by the httpOnly session cookie (see @/lib/auth).
export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),
    }),
    {
      name: "user-storage",
    }
  )
)
