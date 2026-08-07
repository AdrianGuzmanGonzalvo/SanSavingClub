"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CalendarClock, CheckCircle2, Edit3, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DatePicker } from "@/components/date-picker";
import { useI18n } from "@/lib/i18n/i18n-provider";
import { interpolate } from "@/lib/i18n/format";
import { formatDate } from "@/lib/format";
import { updateCycleDatesAction } from "../../actions";

export interface CycleRow {
  cycleNumber: number;
  paymentDueDateISO: string;
  payoutDateISO: string;
  isCompleted: boolean;
}

function toISODate(date: Date | undefined): string {
  if (!date) return "";
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 10);
}

export function CycleDatesPanel({ clubId, cycles, canEdit }: { clubId: string; cycles: CycleRow[]; canEdit: boolean }) {
  const { dict: t, locale } = useI18n();
  const [editing, setEditing] = useState<CycleRow | null>(null);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <CalendarClock className="h-4 w-4 text-primary" />
          {t.clubs.admin.cyclesTitle}
        </CardTitle>
        <CardDescription>{t.clubs.admin.cyclesSubtitle}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {cycles.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">{t.clubs.admin.cyclesEmpty}</p>
        ) : (
          cycles.map((cycle) => (
            <div
              key={cycle.cycleNumber}
              className="flex flex-wrap items-center justify-between gap-3 rounded-md border p-3"
            >
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">#{cycle.cycleNumber}</span>
                  {cycle.isCompleted && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> {t.clubs.admin.cycleCompletedExternally}
                    </Badge>
                  )}
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <CalendarClock className="h-3.5 w-3.5" />
                    {interpolate(t.clubs.detail.dueOnDay, { day: formatDate(cycle.paymentDueDateISO, locale) })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Gift className="h-3.5 w-3.5" />
                    {interpolate(t.clubs.detail.payoutOnDay, { day: formatDate(cycle.payoutDateISO, locale) })}
                  </span>
                </div>
              </div>
              <Button variant="outline" size="sm" disabled={!canEdit} onClick={() => setEditing(cycle)}>
                <Edit3 className="h-3.5 w-3.5" /> {t.clubs.admin.adjustCycleDates}
              </Button>
            </div>
          ))
        )}
      </CardContent>

      <EditCycleDialog key={editing?.cycleNumber ?? "none"} clubId={clubId} cycle={editing} onClose={() => setEditing(null)} />
    </Card>
  );
}

function EditCycleDialog({
  clubId,
  cycle,
  onClose,
}: {
  clubId: string;
  cycle: CycleRow | null;
  onClose: () => void;
}) {
  const { dict: t } = useI18n();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [dueDate, setDueDate] = useState<Date | undefined>(() => (cycle ? new Date(cycle.paymentDueDateISO) : undefined));
  const [payoutDate, setPayoutDate] = useState<Date | undefined>(() => (cycle ? new Date(cycle.payoutDateISO) : undefined));

  function handleOpenChange(open: boolean) {
    if (!open) onClose();
  }

  function handleSave() {
    if (!cycle || !dueDate || !payoutDate) return;
    startTransition(async () => {
      const result = await updateCycleDatesAction(clubId, cycle.cycleNumber, toISODate(dueDate), toISODate(payoutDate));
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(t.clubs.admin.cycleDatesSavedToast);
        handleOpenChange(false);
        router.refresh();
      }
    });
  }

  return (
    <Dialog open={cycle !== null} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit3 className="h-4 w-4 text-primary" />
            {interpolate(t.clubs.admin.adjustCycleDatesTitle, { cycle: cycle?.cycleNumber ?? "" })}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label>{t.clubs.new.currentCycleDueDateLabel}</Label>
            <DatePicker value={dueDate} onChange={setDueDate} />
          </div>
          <div className="flex flex-col gap-2">
            <Label>{t.clubs.new.currentCyclePayoutDateLabel}</Label>
            <DatePicker value={payoutDate} onChange={setPayoutDate} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            {t.common.cancel}
          </Button>
          <Button onClick={handleSave} disabled={isPending || !dueDate || !payoutDate}>
            {t.common.save}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
