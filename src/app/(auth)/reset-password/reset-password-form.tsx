"use client";

import { useActionState } from "react";
import Link from "next/link";
import { KeyRound, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PasswordInput } from "@/components/password-input";
import { SanClubEmblemLogo } from "@/components/SanClubEmblemLogo";
import { useI18n } from "@/lib/i18n/i18n-provider";
import { resetPasswordAction, type ResetPasswordState } from "./actions";

const initialState: ResetPasswordState = {};

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction, isPending] = useActionState(resetPasswordAction, initialState);
  const { dict: t } = useI18n();

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="items-center text-center">
        <SanClubEmblemLogo className="mb-2 h-12 w-12" />
        <CardTitle>{t.auth.resetPassword.title}</CardTitle>
        <CardDescription>{t.auth.resetPassword.subtitle}</CardDescription>
      </CardHeader>
      <CardContent>
        {state.success ? (
          <div className="flex flex-col items-center gap-3 text-center">
            <p className="text-sm text-muted-foreground">{t.auth.resetPassword.successMessage}</p>
            <Button asChild>
              <Link href="/login">{t.auth.forgotPassword.backToLogin}</Link>
            </Button>
          </div>
        ) : !token ? (
          <p className="text-center text-sm text-destructive">{t.auth.resetPassword.errors.invalidLink}</p>
        ) : (
          <form action={formAction} className="flex flex-col gap-4">
            <input type="hidden" name="token" value={token} />
            <div className="flex flex-col gap-2">
              <Label htmlFor="newPassword">{t.profile.newPasswordLabel}</Label>
              <PasswordInput id="newPassword" name="newPassword" required minLength={8} autoComplete="new-password" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="confirmNewPassword">{t.profile.confirmNewPasswordLabel}</Label>
              <PasswordInput
                id="confirmNewPassword"
                name="confirmNewPassword"
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>
            {state.error && <p className="text-sm text-destructive">{state.error}</p>}
            <Button type="submit" disabled={isPending} className="mt-2">
              {isPending ? <Loader2 className="animate-spin" /> : <KeyRound />}
              {isPending ? t.auth.resetPassword.submitting : t.auth.resetPassword.submit}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
