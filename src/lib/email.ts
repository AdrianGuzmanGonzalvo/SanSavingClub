import { Resend } from "resend";

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "SanSavingClub <onboarding@resend.dev>";

function getResendClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  return new Resend(process.env.RESEND_API_KEY);
}

export async function sendPasswordResetEmail(
  to: string,
  resetUrl: string,
  locale: "en" | "es"
): Promise<{ error?: string }> {
  const resend = getResendClient();
  if (!resend) return { error: "Email sending is not configured (missing RESEND_API_KEY)." };

  const subject = locale === "es" ? "Restablece tu contraseña de SanSavingClub" : "Reset your SanSavingClub password";
  const text =
    locale === "es"
      ? `Recibimos una solicitud para restablecer tu contraseña.\n\nHaz clic en el siguiente enlace para elegir una nueva contraseña (válido por 1 hora):\n${resetUrl}\n\nSi no solicitaste esto, puedes ignorar este correo.`
      : `We received a request to reset your password.\n\nClick the link below to choose a new password (valid for 1 hour):\n${resetUrl}\n\nIf you didn't request this, you can safely ignore this email.`;
  const buttonLabel = locale === "es" ? "Restablecer contraseña" : "Reset password";
  const html = `
    <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
      <p style="font-size: 15px; color: #0f172a; line-height: 1.5;">${text.split("\n\n")[0]}</p>
      <p style="margin: 24px 0;">
        <a href="${resetUrl}" style="background: #059669; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">${buttonLabel}</a>
      </p>
      <p style="font-size: 13px; color: #64748b; word-break: break-all;">${resetUrl}</p>
      <p style="font-size: 13px; color: #94a3b8; margin-top: 24px;">${text.split("\n\n").pop()}</p>
    </div>
  `;

  const { error } = await resend.emails.send({ from: FROM_EMAIL, to, subject, text, html });
  if (error) return { error: error.message };
  return {};
}
