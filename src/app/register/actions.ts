"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signIn } from "@/auth";
import { getDictionary, getLocale } from "@/lib/i18n/locale";

export interface RegisterState {
  error?: string;
}

export async function registerAction(_prevState: RegisterState, formData: FormData): Promise<RegisterState> {
  const t = getDictionary(await getLocale());

  const fullName = String(formData.get("fullName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!fullName || !email || !password) {
    return { error: t.auth.register.allFieldsRequired };
  }
  if (password.length < 8) {
    return { error: t.auth.register.passwordTooShort };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: t.auth.register.emailExists };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: { fullName, email, passwordHash },
  });

  await signIn("credentials", { email, password, redirectTo: "/dashboard" });
  return {};
}
