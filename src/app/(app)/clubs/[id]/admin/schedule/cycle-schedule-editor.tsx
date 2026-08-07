"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CalendarRange, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useI18n } from "@/lib/i18n/i18n-provider";
import { interpolate } from "@/lib/i18n/format";
import { formatUSD } from "@/lib/format";
import { updateCycleScheduleAction } from "../../../actions";

export type CycleFrequencyOption = "MONTHLY" | "WEEKLY" | "BI_WEEKLY" | "CUSTOM";

export interface ScheduleRow {
  cycleNumber: number;
  memberName: string | null;
  paymentDueDate: string; // yyyy-mm-dd
  payoutDate: string; // yyyy-mm-dd
  cycleFrequency: CycleFrequencyOption;
}

export function CycleScheduleEditor({
  clubId,
  clubName,
  rows: initialRows,
  potTotal,
  canEdit,
}: {
  clubId: string;
  clubName: string;
  rows: ScheduleRow[];
  potTotal: number;
  canEdit: boolean;
}) {
  const { dict: t } = useI18n();
  const router = useRouter();
  const [rows, setRows] = useState(initialRows);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function updateRow(cycleNumber: number, field: "paymentDueDate" | "payoutDate" | "cycleFrequency", value: string) {
    setRows((prev) => prev.map((r) => (r.cycleNumber === cycleNumber ? { ...r, [field]: value } : r)));
  }

  function handleSave() {
    setError(null);
    startTransition(async () => {
      const result = await updateCycleScheduleAction(
        clubId,
        rows.map((r) => ({
          cycleNumber: r.cycleNumber,
          paymentDueDateISO: r.paymentDueDate,
          payoutDateISO: r.payoutDate,
          cycleFrequency: r.cycleFrequency === "CUSTOM" ? null : r.cycleFrequency,
        }))
      );
      if (result.error) {
        setError(result.error);
        toast.error(result.error);
      } else {
        toast.success(t.clubs.admin.scheduleSavedToast);
        router.refresh();
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <CalendarRange className="h-4 w-4 text-primary" />
          {t.clubs.admin.scheduleTitle}
        </CardTitle>
        <CardDescription>{interpolate(t.clubs.admin.scheduleSubtitle, { club: clubName })}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {rows.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">{t.clubs.admin.cyclesEmpty}</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.clubs.admin.scheduleColumnTurn}</TableHead>
                  <TableHead>{t.clubs.admin.scheduleColumnDue}</TableHead>
                  <TableHead>{t.clubs.admin.scheduleColumnPayout}</TableHead>
                  <TableHead>{t.clubs.admin.scheduleColumnFrequency}</TableHead>
                  <TableHead className="text-right">{t.clubs.admin.scheduleColumnPot}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.cycleNumber}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">#{row.cycleNumber}</Badge>
                        <span className="text-sm">{row.memberName ?? t.clubs.detail.unassigned}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="date"
                        value={row.paymentDueDate}
                        disabled={!canEdit}
                        onChange={(e) => updateRow(row.cycleNumber, "paymentDueDate", e.target.value)}
                        className="w-40"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="date"
                        value={row.payoutDate}
                        disabled={!canEdit}
                        onChange={(e) => updateRow(row.cycleNumber, "payoutDate", e.target.value)}
                        className="w-40"
                      />
                    </TableCell>
                    <TableCell>
                      <Select
                        value={row.cycleFrequency}
                        onValueChange={(v) => updateRow(row.cycleNumber, "cycleFrequency", v)}
                        disabled={!canEdit}
                      >
                        <SelectTrigger className="w-36">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MONTHLY">{t.clubs.new.frequencyMonthly}</SelectItem>
                          <SelectItem value="WEEKLY">{t.clubs.new.frequencyWeekly}</SelectItem>
                          <SelectItem value="BI_WEEKLY">{t.clubs.new.frequencyBiWeekly}</SelectItem>
                          <SelectItem value="CUSTOM">{t.clubs.admin.frequencyCustom}</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">{formatUSD(potTotal)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button onClick={handleSave} disabled={!canEdit || isPending || rows.length === 0} className="self-start">
          {isPending ? <Loader2 className="animate-spin" /> : <Save />}
          {isPending ? t.clubs.admin.savingSchedule : t.clubs.admin.saveSchedule}
        </Button>
      </CardContent>
    </Card>
  );
}
