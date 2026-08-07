"use client";

import { useActionState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { KeyRound, Loader2 } from "lucide-react";
import { useI18n } from "@/lib/i18n/i18n-provider";
import { joinClubAction, type ClubFormState } from "../actions";

const initialState: ClubFormState = {};

export default function JoinClubPage() {
  const [state, formAction, isPending] = useActionState(joinClubAction, initialState);
  const { dict: t } = useI18n();

  return (
    <div className="mx-auto max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>{t.clubs.join.title}</CardTitle>
          <CardDescription>{t.clubs.join.subtitle}</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="inviteCode">{t.clubs.join.inviteCode}</Label>
              <Input
                id="inviteCode"
                name="inviteCode"
                placeholder="ABC1234"
                className="font-mono uppercase tracking-widest"
                required
              />
            </div>
            {state.error && <p className="text-sm text-destructive">{state.error}</p>}
            <Button type="submit" disabled={isPending} className="mt-2">
              {isPending ? <Loader2 className="animate-spin" /> : <KeyRound />}
              {isPending ? t.clubs.join.submitting : t.clubs.join.submit}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
