"use server";

import bcrypt from "bcryptjs";
import QRCode from "qrcode";
import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getDictionary, getLocale } from "@/lib/i18n/locale";
import { buildTotpUri, generateBackupCodes, generateTotpSecret, hashBackupCode, verifyTotpCode } from "@/lib/totp";

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}

export async function markNotificationsReadAction(): Promise<void> {
  const session = await auth();
  if (!session?.user) return;

  await prisma.notification.updateMany({
    where: { userId: session.user.id, isRead: false },
    data: { isRead: true },
  });
}

export interface ProfileFormState {
  error?: string;
}

export async function updateProfileAction(_prevState: ProfileFormState, formData: FormData): Promise<ProfileFormState> {
  const t = getDictionary(await getLocale());
  const session = await auth();
  if (!session?.user) return { error: t.auth.mustBeSignedIn };

  const fullName = String(formData.get("fullName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim() || null;
  if (!fullName) return { error: t.profile.errors.nameRequired };

  await prisma.user.update({ where: { id: session.user.id }, data: { fullName, phone } });

  return {};
}

export async function changePasswordAction(_prevState: ProfileFormState, formData: FormData): Promise<ProfileFormState> {
  const t = getDictionary(await getLocale());
  const session = await auth();
  if (!session?.user) return { error: t.auth.mustBeSignedIn };

  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmNewPassword = String(formData.get("confirmNewPassword") ?? "");

  if (!currentPassword || !newPassword || !confirmNewPassword) {
    return { error: t.profile.errors.allFieldsRequired };
  }
  if (newPassword.length < 8) return { error: t.profile.errors.passwordTooShort };
  if (newPassword !== confirmNewPassword) return { error: t.profile.errors.passwordMismatch };

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user?.passwordHash || !(await bcrypt.compare(currentPassword, user.passwordHash))) {
    return { error: t.profile.errors.currentPasswordIncorrect };
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id: session.user.id }, data: { passwordHash } });

  return {};
}

export interface TwoFactorSetupState {
  error?: string;
  secret?: string;
  qrCodeDataUrl?: string;
}

/** Generates a new secret and QR code but doesn't persist anything yet — only
 * confirmTwoFactorSetupAction enables 2FA, once the user proves they can
 * actually generate a valid code with it. */
export async function startTwoFactorSetupAction(): Promise<TwoFactorSetupState> {
  const t = getDictionary(await getLocale());
  const session = await auth();
  if (!session?.user) return { error: t.auth.mustBeSignedIn };

  const secret = generateTotpSecret();
  const uri = buildTotpUri(secret, session.user.email ?? "");
  const qrCodeDataUrl = await QRCode.toDataURL(uri);

  return { secret, qrCodeDataUrl };
}

export interface TwoFactorConfirmState {
  error?: string;
  backupCodes?: string[];
}

export async function confirmTwoFactorSetupAction(secret: string, code: string): Promise<TwoFactorConfirmState> {
  const t = getDictionary(await getLocale());
  const session = await auth();
  if (!session?.user) return { error: t.auth.mustBeSignedIn };

  if (!verifyTotpCode(secret, code)) {
    return { error: t.profile.errors.invalidTwoFactorCode };
  }

  const backupCodes = generateBackupCodes();
  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      twoFactorEnabled: true,
      twoFactorSecret: secret,
      twoFactorBackupCodes: backupCodes.map(hashBackupCode),
    },
  });

  return { backupCodes };
}

export async function disableTwoFactorAction(_prevState: ProfileFormState, formData: FormData): Promise<ProfileFormState> {
  const t = getDictionary(await getLocale());
  const session = await auth();
  if (!session?.user) return { error: t.auth.mustBeSignedIn };

  const password = String(formData.get("password") ?? "");
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user?.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) {
    return { error: t.profile.errors.currentPasswordIncorrect };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { twoFactorEnabled: false, twoFactorSecret: null, twoFactorBackupCodes: [] },
  });

  return {};
}
