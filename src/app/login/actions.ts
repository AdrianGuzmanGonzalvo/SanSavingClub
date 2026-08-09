"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getDictionary, getLocale } from "@/lib/i18n/locale";

export interface LoginState {
  error?: string;
  requiresTwoFactor?: boolean;
}

export async function loginAction(prevState: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const code = String(formData.get("code") ?? "").trim();
  const callbackUrl = String(formData.get("callbackUrl") || "/dashboard");
  const t = getDictionary(await getLocale());

  // Before attempting a real sign-in, check whether this account needs a 2FA
  // code so the form can reveal that field instead of just failing outright.
  if (!code) {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { passwordHash: true, twoFactorEnabled: true },
    });
    if (user?.passwordHash && user.twoFactorEnabled && (await bcrypt.compare(password, user.passwordHash))) {
      return { requiresTwoFactor: true };
    }
  }

  try {
    await signIn("credentials", { email, password, code, redirectTo: callbackUrl });
    return {};
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        error: prevState.requiresTwoFactor ? t.auth.login.invalidCode : t.auth.login.invalidCredentials,
        requiresTwoFactor: prevState.requiresTwoFactor,
      };
    }
    throw error;
  }
}
