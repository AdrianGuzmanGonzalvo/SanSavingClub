"use server";

import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { generateResetToken } from "@/lib/reset-token";
import { sendPasswordResetEmail } from "@/lib/email";
import { getDictionary, getLocale } from "@/lib/i18n/locale";

export interface ForgotPasswordState {
  error?: string;
  success?: boolean;
}

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

export async function requestPasswordResetAction(
  _prevState: ForgotPasswordState,
  formData: FormData
): Promise<ForgotPasswordState> {
  const locale = await getLocale();
  const t = getDictionary(locale);
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email) return { error: t.auth.forgotPassword.errors.emailRequired };

  const user = await prisma.user.findUnique({ where: { email } });

  // Always report success regardless of whether the account exists, so this
  // form can't be used to discover which emails are registered.
  if (user?.passwordHash) {
    const { raw, hash } = generateResetToken();
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordResetTokenHash: hash, passwordResetTokenExpiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS) },
    });

    const host = (await headers()).get("host");
    const protocol = host?.startsWith("localhost") ? "http" : "https";
    const resetUrl = `${protocol}://${host}/reset-password?token=${raw}`;

    const result = await sendPasswordResetEmail(email, resetUrl, locale);
    // Never leak send failures to the client — that would tell an attacker
    // this email is registered. Log it instead so it's still debuggable.
    if (result.error) console.error("sendPasswordResetEmail failed:", result.error);
  }

  return { success: true };
}
