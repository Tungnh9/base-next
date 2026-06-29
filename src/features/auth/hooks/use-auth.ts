"use client";

import { useActionState } from "react";
import { loginAction, type ActionState } from "../actions";

const initialState: ActionState = {};

export function useLoginAction() {
  const [state, action, isPending] = useActionState(loginAction, initialState);
  return { state, action, isPending };
}
