"use client";

import { useActionState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Mail, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { IconInput } from "@/components/icon-input";
import { SanClubEmblemLogo } from "@/components/SanClubEmblemLogo";
import { useI18n } from "@/lib/i18n/i18n-provider";
import { requestPasswordResetAction, type ForgotPasswordState } from "./actions";

const initialState: ForgotPasswordState = {};

export function ForgotPasswordForm() {
  const [state, formAction, isPending] = useActionState(requestPasswordResetAction, initialState);
  const { dict: t } = useI18n();

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="items-center text-center">
        <SanClubEmblemLogo className="mb-2 h-12 w-12" />
        <CardTitle>{t.auth.forgotPassword.title}</CardTitle>
        <CardDescription>{t.auth.forgotPassword.subtitle}</CardDescription>
      </CardHeader>
      <CardContent>
        {state.success ? (
          <p className="text-center text-sm text-muted-foreground">{t.auth.forgotPassword.successMessage}</p>
        ) : (
          <form action={formAction} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">{t.auth.login.email}</Label>
              <IconInput icon={Mail} id="email" name="email" type="email" required autoComplete="email" />
            </div>
            {state.error && <p className="text-sm text-destructive">{state.error}</p>}
            <Button type="submit" disabled={isPending} className="mt-2">
              {isPending ? <Loader2 className="animate-spin" /> : <Send />}
              {isPending ? t.auth.forgotPassword.submitting : t.auth.forgotPassword.submit}
            </Button>
          </form>
        )}
        <p className="mt-4 text-center text-sm text-muted-foreground">
          <Link href="/login" className="inline-flex items-center gap-1 font-medium text-primary underline-offset-4 hover:underline">
            <ArrowLeft className="h-3.5 w-3.5" /> {t.auth.forgotPassword.backToLogin}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
