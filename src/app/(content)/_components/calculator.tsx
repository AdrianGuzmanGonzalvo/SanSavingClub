"use client";

import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CalculatorLabels } from "@/content/pages";
import { interpolate } from "@/lib/i18n/format";

type Frequency = "weekly" | "biweekly" | "monthly";

const MIN_MEMBERS = 2;
const MAX_MEMBERS = 50;
const WEEKS_PER_CYCLE: Record<Frequency, number> = { weekly: 1, biweekly: 2, monthly: 0 };

const SELECT_CLASS =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30";

/** Date of the payout `cycles` cycles after the first one. Works in UTC so the
 *  result doesn't shift with the visitor's time zone. */
function payoutDate(first: Date, frequency: Frequency, cycles: number): Date {
  const date = new Date(first);
  if (frequency !== "monthly") {
    date.setUTCDate(date.getUTCDate() + cycles * WEEKS_PER_CYCLE[frequency] * 7);
    return date;
  }
  // Same day each month, clamped to the last day of shorter months (Jan 31 → Feb 28).
  const day = date.getUTCDate();
  date.setUTCDate(1);
  date.setUTCMonth(date.getUTCMonth() + cycles);
  const lastDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).getUTCDate();
  date.setUTCDate(Math.min(day, lastDay));
  return date;
}

// /register uses a plain <a> tag on purpose — see (content)/layout.tsx.
export function Calculator({ labels: l, dateLocale }: { labels: CalculatorLabels; dateLocale: string }) {
  const id = useId();
  const [membersInput, setMembersInput] = useState("10");
  const [quotaInput, setQuotaInput] = useState("100");
  const [frequency, setFrequency] = useState<Frequency>("monthly");
  const [startDate, setStartDate] = useState("");
  const [turnInput, setTurnInput] = useState(1);

  const members = Math.min(MAX_MEMBERS, Math.max(MIN_MEMBERS, Math.floor(Number(membersInput)) || MIN_MEMBERS));
  const quota = Math.max(0, Number(quotaInput) || 0);
  const yourTurn = Math.min(turnInput, members);
  const pot = members * quota;
  const lengthCount = frequency === "monthly" ? members : members * WEEKS_PER_CYCLE[frequency];
  const first = startDate ? new Date(`${startDate}T00:00:00Z`) : null;

  const money = new Intl.NumberFormat(dateLocale, { style: "currency", currency: "USD", minimumFractionDigits: 0 });
  const dateFormat = new Intl.DateTimeFormat(dateLocale, { dateStyle: "medium", timeZone: "UTC" });
  const turns = Array.from({ length: members }, (_, i) => i + 1);

  return (
    <div className="flex flex-col gap-8">
      <form className="grid gap-4 rounded-lg border p-5 sm:grid-cols-2" onSubmit={(event) => event.preventDefault()}>
        <div className="flex flex-col gap-2">
          <Label htmlFor={`${id}-members`}>{l.members}</Label>
          <Input
            id={`${id}-members`}
            type="number"
            inputMode="numeric"
            min={MIN_MEMBERS}
            max={MAX_MEMBERS}
            value={membersInput}
            onChange={(event) => setMembersInput(event.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor={`${id}-quota`}>{l.quota}</Label>
          <Input
            id={`${id}-quota`}
            type="number"
            inputMode="decimal"
            min={0}
            step="any"
            value={quotaInput}
            onChange={(event) => setQuotaInput(event.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor={`${id}-frequency`}>{l.frequency}</Label>
          <select
            id={`${id}-frequency`}
            className={SELECT_CLASS}
            value={frequency}
            onChange={(event) => setFrequency(event.target.value as Frequency)}
          >
            <option value="weekly">{l.frequencies.weekly}</option>
            <option value="biweekly">{l.frequencies.biweekly}</option>
            <option value="monthly">{l.frequencies.monthly}</option>
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor={`${id}-turn`}>{l.yourTurn}</Label>
          <select
            id={`${id}-turn`}
            className={SELECT_CLASS}
            value={yourTurn}
            onChange={(event) => setTurnInput(Number(event.target.value))}
          >
            {turns.map((turn) => (
              <option key={turn} value={turn}>
                {turn}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-2 sm:col-span-2">
          <Label htmlFor={`${id}-start`}>{l.startDate}</Label>
          <Input
            id={`${id}-start`}
            type="date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
          />
          <p className="text-xs text-muted-foreground">{l.startDateHint}</p>
        </div>
      </form>

      <section className="flex flex-col gap-4" aria-live="polite">
        <h2 className="text-xl font-semibold tracking-tight">{l.results}</h2>
        <dl className="grid gap-4 sm:grid-cols-3">
          <Stat label={l.potPerTurn} value={money.format(pot)} />
          <Stat label={l.length} value={interpolate(l.lengthUnits[frequency], { n: lengthCount })} />
          <Stat label={l.totalPerMember} value={money.format(pot)} />
        </dl>

        <h3 className="mt-2 font-semibold">{interpolate(l.yourTurnTitle, { n: yourTurn })}</h3>
        <dl className="grid gap-4 sm:grid-cols-3">
          <Stat label={l.paidBefore} value={money.format(yourTurn * quota)} />
          <Stat label={l.receive} value={money.format(pot)} />
          <Stat label={l.stillToPay} value={money.format((members - yourTurn) * quota)} />
        </dl>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold tracking-tight">{l.schedule}</h2>
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-3 py-2 font-semibold">{l.turn}</th>
                <th className="px-3 py-2 font-semibold">{l.date}</th>
                <th className="px-3 py-2 font-semibold">{l.pot}</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              {turns.map((turn) => (
                <tr key={turn} className={turn === yourTurn ? "border-t bg-primary/5 text-foreground" : "border-t"}>
                  <td className="px-3 py-2">
                    {turn}
                    {turn === yourTurn && ` (${l.you})`}
                  </td>
                  <td className="px-3 py-2">
                    {first
                      ? dateFormat.format(payoutDate(first, frequency, turn - 1))
                      : interpolate(l.cycle, { n: turn })}
                  </td>
                  <td className="px-3 py-2">{money.format(pot)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <Button size="lg" asChild className="self-start">
        <a href="/register">{l.cta}</a>
      </Button>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border p-4">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-2xl font-semibold tracking-tight">{value}</dd>
    </div>
  );
}
