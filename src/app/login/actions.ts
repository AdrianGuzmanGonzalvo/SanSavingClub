"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { getDictionary, getLocale } from "@/lib/i18n/locale";

export interface LoginState {
  error?: string;
}

export async function loginAction(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const callbackUrl = String(formData.get("callbackUrl") || "/dashboard");

  try {
    await signIn("credentials", { email, password, redirectTo: callbackUrl });
    return {};
  } catch (error) {
    if (error instanceof AuthError) {
      const t = getDictionary(await getLocale());
      return { error: t.auth.login.invalidCredentials };
    }
    throw error;
  }
}
