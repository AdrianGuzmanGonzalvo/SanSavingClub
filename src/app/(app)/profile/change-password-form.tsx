"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { KeyRound, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/password-input";
import { useI18n } from "@/lib/i18n/i18n-provider";
import { changePasswordAction } from "../actions";

export function ChangePasswordForm() {
  const { dict: t } = useI18n();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    const form = e.currentTarget;
    startTransition(async () => {
      const result = await changePasswordAction({}, formData);
      if (result.error) {
        setError(result.error);
        toast.error(result.error);
      } else {
        toast.success(t.profile.changedToast);
        form.reset();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="currentPassword">{t.profile.currentPasswordLabel}</Label>
        <PasswordInput id="currentPassword" name="currentPassword" required autoComplete="current-password" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="newPassword">{t.profile.newPasswordLabel}</Label>
        <PasswordInput id="newPassword" name="newPassword" required minLength={8} autoComplete="new-password" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="confirmNewPassword">{t.profile.confirmNewPasswordLabel}</Label>
        <PasswordInput id="confirmNewPassword" name="confirmNewPassword" required minLength={8} autoComplete="new-password" />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={isPending} className="mt-2 self-start">
        {isPending ? <Loader2 className="animate-spin" /> : <KeyRound />}
        {isPending ? t.profile.changing : t.profile.changePassword}
      </Button>
    </form>
  );
}
