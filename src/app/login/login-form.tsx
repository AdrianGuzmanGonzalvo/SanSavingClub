"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Loader2, LogIn, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { IconInput } from "@/components/icon-input";
import { SanClubEmblemLogo } from "@/components/SanClubEmblemLogo";
import { PasswordInput } from "@/components/password-input";
import { useI18n } from "@/lib/i18n/i18n-provider";
import { loginAction, type LoginState } from "./actions";

const initialState: LoginState = {};

export function LoginForm({ callbackUrl }: { callbackUrl: string }) {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);
  const { dict: t } = useI18n();

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="items-center text-center">
        <SanClubEmblemLogo className="mb-2 h-12 w-12" />
        <CardTitle>{t.auth.login.title}</CardTitle>
        <CardDescription>{t.auth.login.subtitle}</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="callbackUrl" value={callbackUrl} />
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">{t.auth.login.email}</Label>
            <IconInput icon={Mail} id="email" name="email" type="email" required autoComplete="email" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">{t.auth.login.password}</Label>
            <PasswordInput id="password" name="password" required autoComplete="current-password" />
          </div>
          {state.error && <p className="text-sm text-destructive">{state.error}</p>}
          <Button type="submit" disabled={isPending} className="mt-2">
            {isPending ? <Loader2 className="animate-spin" /> : <LogIn />}
            {isPending ? t.auth.login.submitting : t.auth.login.submit}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          {t.auth.login.noAccount}{" "}
          <Link href="/register" className="font-medium text-primary underline-offset-4 hover:underline">
            {t.auth.login.createOne}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
