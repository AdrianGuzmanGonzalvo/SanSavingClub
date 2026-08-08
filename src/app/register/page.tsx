"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Loader2, Mail, User, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { IconInput } from "@/components/icon-input";
import { SanSavingClubLogo } from "@/components/SanSavingClubLogo";
import { PasswordInput } from "@/components/password-input";
import { useI18n } from "@/lib/i18n/i18n-provider";
import { registerAction, type RegisterState } from "./actions";

const initialState: RegisterState = {};

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(registerAction, initialState);
  const { dict: t } = useI18n();

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <div className="absolute right-4 top-4 flex items-center gap-2">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center text-center">
          <SanSavingClubLogo className="mb-2 h-12 w-12" />
          <CardTitle>{t.auth.register.title}</CardTitle>
          <CardDescription>{t.auth.register.subtitle}</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="fullName">{t.auth.register.fullName}</Label>
              <IconInput icon={User} id="fullName" name="fullName" required autoComplete="name" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">{t.auth.register.email}</Label>
              <IconInput icon={Mail} id="email" name="email" type="email" required autoComplete="email" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">{t.auth.register.password}</Label>
              <PasswordInput id="password" name="password" required minLength={8} autoComplete="new-password" />
            </div>
            {state.error && <p className="text-sm text-destructive">{state.error}</p>}
            <Button type="submit" disabled={isPending} className="mt-2">
              {isPending ? <Loader2 className="animate-spin" /> : <UserPlus />}
              {isPending ? t.auth.register.submitting : t.auth.register.submit}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            {t.auth.register.haveAccount}{" "}
            <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
              {t.auth.register.signIn}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
