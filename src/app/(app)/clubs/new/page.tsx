"use client";

import { useActionState, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { DatePicker } from "@/components/date-picker";
import { Loader2, PlusCircle, RefreshCw, Sparkles } from "lucide-react";
import { useI18n } from "@/lib/i18n/i18n-provider";
import { interpolate } from "@/lib/i18n/format";
import { cn } from "@/lib/utils";
import { createClubAction, type ClubFormState } from "../actions";

const initialState: ClubFormState = {};

type DurationUnit = "WEEK" | "MONTH";
type ClubMode = "new" | "existing";
type Frequency = "WEEKLY" | "BI_WEEKLY" | "EVERY_OTHER_WEEK" | "MONTHLY";

function toISODate(date: Date | undefined): string {
  if (!date) return "";
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 10);
}

export default function NewClubPage() {
  const [state, formAction, isPending] = useActionState(createClubAction, initialState);
  const { dict: t } = useI18n();

  const [mode, setMode] = useState<ClubMode>("new");
  const [unit, setUnit] = useState<DurationUnit>("MONTH");
  const [frequency, setFrequency] = useState<Frequency>("WEEKLY");
  const [quotaAmount, setQuotaAmount] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [startCycleNumber, setStartCycleNumber] = useState("1");
  const [currentDueDate, setCurrentDueDate] = useState<Date | undefined>(undefined);
  const [currentPayoutDate, setCurrentPayoutDate] = useState<Date | undefined>(undefined);
  const [adminParticipates, setAdminParticipates] = useState(true);

  function handleUnitChange(next: DurationUnit) {
    setUnit(next);
    setFrequency(next === "WEEK" ? "WEEKLY" : "MONTHLY");
    setStartCycleNumber("1");
  }

  // The leader enters quota + total instead of picking a member count directly —
  // the number of members/turns the club needs falls out of total ÷ quota.
  const quotaNum = Number(quotaAmount);
  const totalNum = Number(totalAmount);
  const rawCount = quotaNum > 0 && totalNum > 0 ? totalNum / quotaNum : 0;
  const isDivisible = rawCount > 0 && Math.abs(rawCount - Math.round(rawCount)) < 1e-6;
  const computedCount = isDivisible ? Math.round(rawCount) : 0;
  const countForCycleSelect = computedCount > 0 ? computedCount : 1;

  return (
    <div className="mx-auto max-w-md">
      <Card className="overflow-hidden shadow-lg">
        <CardHeader className="bg-gradient-to-br from-emerald-600 via-teal-700 to-indigo-800 py-6 text-white">
          <CardTitle className="text-white">{t.clubs.new.title}</CardTitle>
          <CardDescription className="text-white/80">{t.clubs.new.subtitle}</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <form action={formAction} className="flex flex-col gap-4">
            <input type="hidden" name="mode" value={mode} />

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMode("new")}
                className={cn(
                  "flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition-colors",
                  mode === "new" ? "border-primary bg-primary/5" : "hover:bg-accent/50"
                )}
              >
                <span className="flex items-center gap-1.5 font-medium">
                  <Sparkles className="h-4 w-4 text-primary" /> {t.clubs.new.modeNew}
                </span>
                <span className="text-xs text-muted-foreground">{t.clubs.new.modeNewDesc}</span>
              </button>
              <button
                type="button"
                onClick={() => setMode("existing")}
                className={cn(
                  "flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition-colors",
                  mode === "existing" ? "border-primary bg-primary/5" : "hover:bg-accent/50"
                )}
              >
                <span className="flex items-center gap-1.5 font-medium">
                  <RefreshCw className="h-4 w-4 text-primary" /> {t.clubs.new.modeExisting}
                </span>
                <span className="text-xs text-muted-foreground">{t.clubs.new.modeExistingDesc}</span>
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="name">{t.clubs.new.name}</Label>
              <Input id="name" name="name" placeholder={t.clubs.new.namePlaceholder} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="quotaAmount">{t.clubs.new.quotaAmount}</Label>
                <Input
                  id="quotaAmount"
                  name="quotaAmount"
                  type="number"
                  min="1"
                  step="0.01"
                  placeholder="100.00"
                  value={quotaAmount}
                  onChange={(e) => setQuotaAmount(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="totalAmount">{t.clubs.new.totalAmount}</Label>
                <Input
                  id="totalAmount"
                  name="totalAmount"
                  type="number"
                  min="1"
                  step="0.01"
                  placeholder={t.clubs.new.totalAmountPlaceholder}
                  value={totalAmount}
                  onChange={(e) => {
                    setTotalAmount(e.target.value);
                    setStartCycleNumber("1");
                  }}
                  required
                />
              </div>
            </div>
            <p className="-mt-2 text-xs text-muted-foreground">
              {totalAmount && quotaAmount
                ? isDivisible
                  ? interpolate(t.clubs.new.totalAmountComputedLabel, { n: computedCount })
                  : t.clubs.new.errors.totalNotDivisible
                : t.clubs.new.totalAmountHint}
            </p>

            <div className="flex flex-col gap-2">
              <Label htmlFor="durationUnit">{t.clubs.new.durationUnit}</Label>
              <input type="hidden" name="durationUnit" value={unit} />
              <Select value={unit} onValueChange={(v) => handleUnitChange(v as DurationUnit)}>
                <SelectTrigger id="durationUnit" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WEEK">{t.clubs.new.unitWeek}</SelectItem>
                  <SelectItem value="MONTH">{t.clubs.new.unitMonth}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {unit === "WEEK" && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="frequency">{t.clubs.new.frequencyLabel}</Label>
                <input type="hidden" name="frequency" value={frequency} />
                <Select value={frequency} onValueChange={(v) => setFrequency(v as Frequency)}>
                  <SelectTrigger id="frequency" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WEEKLY">{t.clubs.new.frequencyWeekly}</SelectItem>
                    <SelectItem value="BI_WEEKLY">{t.clubs.new.frequencyBiWeekly}</SelectItem>
                    <SelectItem value="EVERY_OTHER_WEEK">{t.clubs.new.frequencyEveryOtherWeek}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {mode === "new" ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <Label>{t.clubs.new.firstCycleDueDateLabel}</Label>
                    <input type="hidden" name="currentCycleDueDate" value={toISODate(currentDueDate)} />
                    <DatePicker value={currentDueDate} onChange={setCurrentDueDate} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label>{t.clubs.new.firstCyclePayoutDateLabel}</Label>
                    <input type="hidden" name="currentCyclePayoutDate" value={toISODate(currentPayoutDate)} />
                    <DatePicker value={currentPayoutDate} onChange={setCurrentPayoutDate} />
                  </div>
                </div>
                <input type="hidden" name="startCycleNumber" value="1" />
                <p className="-mt-2 text-xs text-muted-foreground">{t.clubs.new.firstDatesHint}</p>
              </>
            ) : (
              <div className="flex flex-col gap-4 rounded-lg border border-dashed p-3">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="startCycleNumber">{t.clubs.new.currentCycleLabel}</Label>
                  <input type="hidden" name="startCycleNumber" value={startCycleNumber} />
                  <Select value={startCycleNumber} onValueChange={setStartCycleNumber}>
                    <SelectTrigger id="startCycleNumber" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: countForCycleSelect }, (_, i) => i + 1).map((n) => (
                        <SelectItem key={n} value={String(n)}>
                          {interpolate(t.clubs.new.currentCycleOption, { n, total: countForCycleSelect })}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label>{t.clubs.new.currentCycleDueDateLabel}</Label>
                  <input type="hidden" name="currentCycleDueDate" value={toISODate(currentDueDate)} />
                  <DatePicker value={currentDueDate} onChange={setCurrentDueDate} />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>{t.clubs.new.currentCyclePayoutDateLabel}</Label>
                  <input type="hidden" name="currentCyclePayoutDate" value={toISODate(currentPayoutDate)} />
                  <DatePicker value={currentPayoutDate} onChange={setCurrentPayoutDate} />
                </div>
                <p className="text-xs text-muted-foreground">{t.clubs.new.modeExistingHint}</p>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <Label htmlFor="lateFeeAmount">{t.clubs.new.lateFeeAmount}</Label>
              <Input id="lateFeeAmount" name="lateFeeAmount" type="number" min="0" step="0.01" defaultValue={0} />
              <p className="text-xs text-muted-foreground">{t.clubs.new.lateFeeHint}</p>
            </div>

            <input type="hidden" name="adminParticipates" value={adminParticipates ? "true" : "false"} />
            <div className="flex items-center justify-between gap-3 rounded-lg border p-3">
              <div className="flex flex-col gap-0.5">
                <Label htmlFor="adminParticipates">{t.clubs.new.adminParticipatesLabel}</Label>
                <p className="text-xs text-muted-foreground">{t.clubs.new.adminParticipatesHint}</p>
              </div>
              <Switch id="adminParticipates" checked={adminParticipates} onCheckedChange={setAdminParticipates} />
            </div>

            {state.error && <p className="text-sm text-destructive">{state.error}</p>}

            <Button type="submit" disabled={isPending} className="mt-2">
              {isPending ? <Loader2 className="animate-spin" /> : <PlusCircle />}
              {isPending ? t.clubs.new.submitting : t.clubs.new.submit}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
