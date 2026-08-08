"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CircleDollarSign, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useI18n } from "@/lib/i18n/i18n-provider";
import { interpolate } from "@/lib/i18n/format";
import { formatUSD } from "@/lib/format";
import { recordManualPaymentAction } from "../../actions";

const METHODS = ["CASH", "ZELLE", "CASH_APP", "BANK_TRANSFER", "OTHER"] as const;

export interface PayableMember {
  userId: string;
  fullName: string;
}

export function AdminRecordPaymentCard({
  clubId,
  quotaAmount,
  members,
}: {
  clubId: string;
  quotaAmount: number;
  members: PayableMember[];
}) {
  const { dict: t } = useI18n();
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [memberUserId, setMemberUserId] = useState<string>(members[0]?.userId ?? "");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!memberUserId) return;
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await recordManualPaymentAction(clubId, memberUserId, {}, formData);
      if (result.error) {
        setError(result.error);
        toast.error(result.error);
      } else {
        const name = members.find((m) => m.userId === memberUserId)?.fullName ?? "";
        toast.success(interpolate(t.clubs.admin.recordPaymentToast, { name }));
        formRef.current?.reset();
        setMemberUserId(members[0]?.userId ?? "");
        router.refresh();
      }
    });
  }

  if (members.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <CircleDollarSign className="h-4 w-4 text-primary" />
          {t.clubs.pay.recordForMemberTitle}
        </CardTitle>
        <CardDescription>{t.clubs.pay.recordForMemberDescription}</CardDescription>
      </CardHeader>
      <CardContent>
        <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="memberUserId">{t.clubs.pay.selectMember}</Label>
            <Select value={memberUserId} onValueChange={setMemberUserId}>
              <SelectTrigger id="memberUserId" className="w-full">
                <SelectValue placeholder={t.clubs.pay.chooseMember} />
              </SelectTrigger>
              <SelectContent>
                {members.map((m) => (
                  <SelectItem key={m.userId} value={m.userId}>
                    {m.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="amount">{t.clubs.pay.amount}</Label>
            <Input id="amount" name="amount" type="number" min="0.01" step="0.01" defaultValue={quotaAmount} required />
            <p className="text-xs text-muted-foreground">
              {interpolate(t.clubs.pay.suggestedAmount, { amount: formatUSD(quotaAmount) })}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="method">{t.clubs.pay.method}</Label>
            <Select name="method" defaultValue="CASH">
              <SelectTrigger id="method" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {METHODS.map((method) => (
                  <SelectItem key={method} value={method}>
                    {t.common.paymentMethods[method]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="notes">{t.clubs.admin.notesLabel}</Label>
            <Textarea id="notes" name="notes" placeholder={t.clubs.admin.notesPlaceholder} />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" disabled={isPending || !memberUserId} className="mt-2">
            {isPending ? <Loader2 className="animate-spin" /> : <Save />}
            {isPending ? t.clubs.admin.recordingPayment : t.clubs.admin.recordPaymentButton}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
