"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CircleDollarSign, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useI18n } from "@/lib/i18n/i18n-provider";
import { interpolate } from "@/lib/i18n/format";
import { MemberStatusBadge } from "../../status-badge";
import type { MemberDisplayStatus } from "@/lib/club";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { recordManualPaymentAction } from "../../../actions";

const METHODS = ["CASH", "ZELLE", "CASH_APP", "BANK_TRANSFER", "OTHER"] as const;

export interface MemberQuotaRow {
  userId: string;
  fullName: string;
  status: MemberDisplayStatus;
  suggestedAmount: number;
}

export function QuotaStatusTable({ clubId, rows, t }: { clubId: string; rows: MemberQuotaRow[]; t: Dictionary }) {
  const [recording, setRecording] = useState<MemberQuotaRow | null>(null);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <CircleDollarSign className="h-4 w-4 text-primary" />
          {t.clubs.admin.quotaStatus}
        </CardTitle>
        <CardDescription>{t.clubs.admin.recordPaymentDescription}</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t.clubs.detail.member}</TableHead>
              <TableHead>{t.clubs.admin.quotaStatus}</TableHead>
              <TableHead className="text-right">{t.clubs.admin.recordPayment}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.userId}>
                <TableCell className="font-medium">{row.fullName}</TableCell>
                <TableCell>
                  <MemberStatusBadge status={row.status} t={t} />
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" onClick={() => setRecording(row)}>
                    {t.clubs.admin.recordPayment}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      <RecordPaymentDialog key={recording?.userId ?? "none"} clubId={clubId} member={recording} onClose={() => setRecording(null)} />
    </Card>
  );
}

function RecordPaymentDialog({
  clubId,
  member,
  onClose,
}: {
  clubId: string;
  member: MemberQuotaRow | null;
  onClose: () => void;
}) {
  const { dict: t } = useI18n();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!member) return;
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await recordManualPaymentAction(clubId, member.userId, {}, formData);
      if (result.error) {
        setError(result.error);
        toast.error(result.error);
      } else {
        toast.success(interpolate(t.clubs.admin.recordPaymentToast, { name: member.fullName }));
        onClose();
        router.refresh();
      }
    });
  }

  return (
    <Dialog open={member !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        {member && (
          <>
            <DialogHeader>
              <DialogTitle>{interpolate(t.clubs.admin.recordPaymentTitle, { name: member.fullName })}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="amount">{t.clubs.pay.amount}</Label>
                <Input id="amount" name="amount" type="number" min="0.01" step="0.01" defaultValue={member.suggestedAmount} required />
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
              <DialogFooter>
                <Button type="submit" disabled={isPending}>
                  {isPending ? <Loader2 className="animate-spin" /> : null}
                  {isPending ? t.clubs.admin.recordingPayment : t.clubs.admin.recordPaymentButton}
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
