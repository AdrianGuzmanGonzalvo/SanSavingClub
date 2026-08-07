"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IconInput } from "@/components/icon-input";
import { Phone, User } from "lucide-react";
import { useI18n } from "@/lib/i18n/i18n-provider";
import { updateProfileAction } from "../actions";

export function ProfileDetailsForm({
  fullName,
  phone,
  email,
}: {
  fullName: string;
  phone: string;
  email: string;
}) {
  const { dict: t } = useI18n();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await updateProfileAction({}, formData);
      if (result.error) {
        setError(result.error);
        toast.error(result.error);
      } else {
        toast.success(t.profile.savedToast);
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="fullName">{t.profile.fullNameLabel}</Label>
        <IconInput icon={User} id="fullName" name="fullName" defaultValue={fullName} required />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="phone">{t.profile.phoneLabel}</Label>
        <IconInput icon={Phone} id="phone" name="phone" defaultValue={phone} placeholder={t.profile.phonePlaceholder} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">{t.profile.emailLabel}</Label>
        <Input id="email" value={email} disabled />
        <p className="text-xs text-muted-foreground">{t.profile.emailHint}</p>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={isPending} className="mt-2 self-start">
        {isPending ? <Loader2 className="animate-spin" /> : <Save />}
        {isPending ? t.profile.saving : t.profile.saveChanges}
      </Button>
    </form>
  );
}
