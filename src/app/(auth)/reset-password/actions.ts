"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { hashResetToken } from "@/lib/reset-token";
import { getDictionary, getLocale } from "@/lib/i18n/locale";

export interface ResetPasswordState {
  error?: string;
  success?: boolean;
}

export async function resetPasswordAction(
  _prevState: ResetPasswordState,
  formData: FormData
): Promise<ResetPasswordState> {
  const t = getDictionary(await getLocale());
  const token = String(formData.get("token") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmNewPassword = String(formData.get("confirmNewPassword") ?? "");

  if (!token) return { error: t.auth.resetPassword.errors.invalidLink };
  if (!newPassword || !confirmNewPassword) return { error: t.profile.errors.allFieldsRequired };
  if (newPassword.length < 8) return { error: t.profile.errors.passwordTooShort };
  if (newPassword !== confirmNewPassword) return { error: t.profile.errors.passwordMismatch };

  const tokenHash = hashResetToken(token);
  const user = await prisma.user.findFirst({
    where: { passwordResetTokenHash: tokenHash, passwordResetTokenExpiresAt: { gt: new Date() } },
  });
  if (!user) return { error: t.auth.resetPassword.errors.invalidLink };

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash, passwordResetTokenHash: null, passwordResetTokenExpiresAt: null },
  });

  return { success: true };
}
