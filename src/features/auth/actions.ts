"use server";

import { redirect } from "next/navigation";
import { signToken, setSessionCookie, clearSessionCookie } from "@/lib/auth";
import { ROUTES } from "@/lib/constants";
import { authApi } from "./api";
import { loginSchema } from "./schemas";

export interface ActionState {
  error?: string;
  success?: boolean;
}

export async function loginAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const raw = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { data, error } = await authApi.login(parsed.data);

  if (error) {
    return { error: error.message };
  }

  if (!data?.user) {
    return { error: "Unexpected response from server" };
  }

  const token = await signToken({
    userId: data.user.id,
    email: data.user.email,
    role: data.user.role,
  });

  await setSessionCookie(token);
  redirect(ROUTES.dashboard);
}

export async function logoutAction(): Promise<void> {
  await clearSessionCookie();
  redirect(ROUTES.login);
}
