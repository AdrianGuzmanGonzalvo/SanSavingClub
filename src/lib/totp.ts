import crypto from "crypto";
import * as OTPAuth from "otpauth";

const ISSUER = "SanSavingClub";

export function generateTotpSecret(): string {
  return new OTPAuth.Secret({ size: 20 }).base32;
}

function buildTotp(secret: string, email?: string): OTPAuth.TOTP {
  return new OTPAuth.TOTP({
    issuer: ISSUER,
    label: email ?? ISSUER,
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromBase32(secret),
  });
}

/** The otpauth:// URI an authenticator app's QR scanner expects. */
export function buildTotpUri(secret: string, email: string): string {
  return buildTotp(secret, email).toString();
}

/** Accepts a code from the current or adjacent 30s window, to tolerate minor clock drift. */
export function verifyTotpCode(secret: string, code: string): boolean {
  const cleaned = code.replace(/\s+/g, "");
  if (!/^\d{6}$/.test(cleaned)) return false;
  const delta = buildTotp(secret).validate({ token: cleaned, window: 1 });
  return delta !== null;
}

export function generateBackupCodes(count = 8): string[] {
  return Array.from({ length: count }, () => crypto.randomBytes(5).toString("hex"));
}

export function hashBackupCode(code: string): string {
  return crypto.createHash("sha256").update(code.trim().toLowerCase()).digest("hex");
}
