"use client";

import { useActionState, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, PlusCircle } from "lucide-react";
import { useI18n } from "@/lib/i18n/i18n-provider";
import { interpolate } from "@/lib/i18n/format";
import { createClubAction, type ClubFormState } from "../actions";

const initialState: ClubFormState = {};

type DurationUnit = "WEEK" | "MONTH";

const COUNT_OPTIONS: Record<DurationUnit, number[]> = {
  MONTH: [3, 6, 9, 12, 18, 24],
  WEEK: [4, 8, 12, 16, 20, 24, 26, 39, 52],
};

const DEFAULT_COUNT: Record<DurationUnit, number> = { MONTH: 12, WEEK: 12 };
const DEFAULT_DUE_DAY: Record<DurationUnit, number> = { MONTH: 1, WEEK: 5 };
const DEFAULT_PAYOUT_DAY: Record<DurationUnit, number> = { MONTH: 5, WEEK: 0 };

export default function NewClubPage() {
  const [state, formAction, isPending] = useActionState(createClubAction, initialState);
  const { dict: t } = useI18n();

  const [unit, setUnit] = useState<DurationUnit>("MONTH");
  const [count, setCount] = useState(String(DEFAULT_COUNT.MONTH));
  const [paymentDueDay, setPaymentDueDay] = useState(String(DEFAULT_DUE_DAY.MONTH));
  const [payoutDay, setPayoutDay] = useState(String(DEFAULT_PAYOUT_DAY.MONTH));

  function handleUnitChange(next: DurationUnit) {
    setUnit(next);
    setCount(String(DEFAULT_COUNT[next]));
    setPaymentDueDay(String(DEFAULT_DUE_DAY[next]));
    setPayoutDay(String(DEFAULT_PAYOUT_DAY[next]));
  }

  const countLabel = (n: number) => interpolate(unit === "WEEK" ? t.clubs.new.weeks : t.clubs.new.months, { n });
  const dueDayHint = unit === "WEEK" ? t.clubs.new.paymentDueDayHintWeek : t.clubs.new.paymentDueDayHintMonth;
  const payoutDayHint = unit === "WEEK" ? t.clubs.new.payoutDayHintWeek : t.clubs.new.payoutDayHintMonth;

  return (
    <div className="mx-auto max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>{t.clubs.new.title}</CardTitle>
          <CardDescription>{t.clubs.new.subtitle}</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">{t.clubs.new.name}</Label>
              <Input id="name" name="name" placeholder={t.clubs.new.namePlaceholder} required />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="monthlyAmount">{t.clubs.new.monthlyAmount}</Label>
              <Input
                id="monthlyAmount"
                name="monthlyAmount"
                type="number"
                min="1"
                step="0.01"
                placeholder="100.00"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
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
              <div className="flex flex-col gap-2">
                <Label htmlFor="durationCount">{t.clubs.new.duration}</Label>
                <input type="hidden" name="durationCount" value={count} />
                <Select value={count} onValueChange={setCount}>
                  <SelectTrigger id="durationCount" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNT_OPTIONS[unit].map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {countLabel(n)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="paymentDueDay">{t.clubs.new.paymentDueDay}</Label>
                <input type="hidden" name="paymentDueDay" value={paymentDueDay} />
                {unit === "WEEK" ? (
                  <Select value={paymentDueDay} onValueChange={setPaymentDueDay}>
                    <SelectTrigger id="paymentDueDay" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {t.common.weekdays.map((day, i) => (
                        <SelectItem key={day} value={String(i)}>
                          {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id="paymentDueDay"
                    type="number"
                    min="1"
                    max="28"
                    value={paymentDueDay}
                    onChange={(e) => setPaymentDueDay(e.target.value)}
                    required
                  />
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="payoutDay">{t.clubs.new.payoutDay}</Label>
                <input type="hidden" name="payoutDay" value={payoutDay} />
                {unit === "WEEK" ? (
                  <Select value={payoutDay} onValueChange={setPayoutDay}>
                    <SelectTrigger id="payoutDay" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {t.common.weekdays.map((day, i) => (
                        <SelectItem key={day} value={String(i)}>
                          {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id="payoutDay"
                    type="number"
                    min="1"
                    max="28"
                    value={payoutDay}
                    onChange={(e) => setPayoutDay(e.target.value)}
                    required
                  />
                )}
              </div>
            </div>
            <p className="-mt-2 text-xs text-muted-foreground">
              {dueDayHint} {payoutDayHint}
            </p>

            <div className="flex flex-col gap-2">
              <Label htmlFor="lateFeeAmount">{t.clubs.new.lateFeeAmount}</Label>
              <Input id="lateFeeAmount" name="lateFeeAmount" type="number" min="0" step="0.01" defaultValue={0} />
              <p className="text-xs text-muted-foreground">{t.clubs.new.lateFeeHint}</p>
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
