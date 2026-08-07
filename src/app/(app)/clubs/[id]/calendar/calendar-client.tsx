"use client";

import { useMemo, useState } from "react";
import { isSameDay } from "date-fns";
import { es as esLocale } from "date-fns/locale";
import { Gift, PiggyBank } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useI18n } from "@/lib/i18n/i18n-provider";
import { interpolate } from "@/lib/i18n/format";
import { formatDate } from "@/lib/format";

export interface CycleInfo {
  cycle: number;
  dueDateISO: string;
  payoutDateISO: string;
  dueColor: "green" | "amber" | "red";
  paidMembers: string[];
  pendingMembers: string[];
  payoutMemberName: string | null;
}

type SelectedDay = { type: "due" | "payout"; cycle: CycleInfo } | null;

const DUE_COLOR_CLASSES: Record<CycleInfo["dueColor"], string> = {
  green: "bg-emerald-200 text-emerald-950 hover:bg-emerald-200 dark:bg-emerald-800 dark:text-emerald-50",
  amber: "bg-amber-200 text-amber-950 hover:bg-amber-200 dark:bg-amber-800 dark:text-amber-50",
  red: "bg-red-200 text-red-950 hover:bg-red-200 dark:bg-red-800 dark:text-red-50",
};

export function ClubCalendarClient({ cycles, notActive }: { cycles: CycleInfo[]; notActive: boolean }) {
  const { dict: t, locale } = useI18n();
  const [selected, setSelected] = useState<SelectedDay>(null);

  const dueDatesByColor = useMemo(() => {
    const groups: Record<CycleInfo["dueColor"], Date[]> = { green: [], amber: [], red: [] };
    for (const c of cycles) groups[c.dueColor].push(new Date(c.dueDateISO));
    return groups;
  }, [cycles]);

  const payoutDates = useMemo(() => cycles.map((c) => new Date(c.payoutDateISO)), [cycles]);

  function handleDayClick(day: Date) {
    const dueMatch = cycles.find((c) => isSameDay(new Date(c.dueDateISO), day));
    if (dueMatch) {
      setSelected({ type: "due", cycle: dueMatch });
      return;
    }
    const payoutMatch = cycles.find((c) => isSameDay(new Date(c.payoutDateISO), day));
    if (payoutMatch) setSelected({ type: "payout", cycle: payoutMatch });
  }

  if (notActive) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">{t.clubs.calendar.notActive}</CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardContent className="flex flex-col gap-4 py-4">
          <div className="flex flex-wrap gap-4 text-sm">
            <LegendItem colorClass="bg-emerald-200 dark:bg-emerald-800" label={t.clubs.calendar.legendApproved} />
            <LegendItem colorClass="bg-amber-200 dark:bg-amber-800" label={t.clubs.calendar.legendReported} />
            <LegendItem colorClass="bg-red-200 dark:bg-red-800" label={t.clubs.calendar.legendOverdue} />
            <LegendItem colorClass="bg-blue-500" label={t.clubs.calendar.legendPayout} icon={<Gift className="h-3 w-3 text-white" />} />
          </div>

          <Calendar
            className="mx-auto"
            locale={locale === "es" ? esLocale : undefined}
            onDayClick={handleDayClick}
            modifiers={{
              dueGreen: dueDatesByColor.green,
              dueAmber: dueDatesByColor.amber,
              dueRed: dueDatesByColor.red,
              payout: payoutDates,
            }}
            modifiersClassNames={{
              dueGreen: DUE_COLOR_CLASSES.green,
              dueAmber: DUE_COLOR_CLASSES.amber,
              dueRed: DUE_COLOR_CLASSES.red,
              payout: "ring-2 ring-blue-500 ring-offset-1",
            }}
          />
        </CardContent>
      </Card>

      <Dialog open={selected !== null} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent>
          {selected?.type === "due" && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <PiggyBank className="h-4 w-4 text-primary" />
                  {interpolate(t.clubs.calendar.dueDrawerTitle, {
                    date: formatDate(selected.cycle.dueDateISO, locale),
                  })}
                </DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="mb-2 text-sm font-medium text-emerald-700 dark:text-emerald-400">
                    {t.clubs.calendar.paidMembers} ({selected.cycle.paidMembers.length})
                  </p>
                  <ul className="flex flex-col gap-1 text-sm text-muted-foreground">
                    {selected.cycle.paidMembers.map((name) => (
                      <li key={name}>{name}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="mb-2 text-sm font-medium text-amber-700 dark:text-amber-400">
                    {t.clubs.calendar.pendingMembers} ({selected.cycle.pendingMembers.length})
                  </p>
                  <ul className="flex flex-col gap-1 text-sm text-muted-foreground">
                    {selected.cycle.pendingMembers.map((name) => (
                      <li key={name}>{name}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          )}
          {selected?.type === "payout" && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Gift className="h-4 w-4 text-primary" />
                  {interpolate(t.clubs.calendar.payoutDrawerTitle, {
                    date: formatDate(selected.cycle.payoutDateISO, locale),
                  })}
                </DialogTitle>
              </DialogHeader>
              <p className="text-sm text-muted-foreground">
                {selected.cycle.payoutMemberName ? (
                  <>
                    <span className="font-medium text-foreground">{t.clubs.calendar.payoutRecipient}: </span>
                    {selected.cycle.payoutMemberName}
                  </>
                ) : (
                  t.clubs.calendar.noRecipientAssigned
                )}
              </p>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function LegendItem({ colorClass, label, icon }: { colorClass: string; label: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`flex h-4 w-4 items-center justify-center rounded-full ${colorClass}`}>{icon}</span>
      <span className="text-muted-foreground">{label}</span>
    </div>
  );
}
