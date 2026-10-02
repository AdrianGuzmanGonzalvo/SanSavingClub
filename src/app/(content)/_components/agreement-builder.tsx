"use client";

import { useId, useState } from "react";
import { Check, Copy, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AgreementLabels } from "@/content/pages";
import { interpolate } from "@/lib/i18n/format";

type Frequency = "weekly" | "biweekly" | "monthly";
type Refund = "now" | "end";

const SELECT_CLASS =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30";

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function AgreementBuilder({ labels: l, dateLocale }: { labels: AgreementLabels; dateLocale: string }) {
  const id = useId();
  const [club, setClub] = useState("");
  const [membersInput, setMembersInput] = useState("10");
  const [quotaInput, setQuotaInput] = useState("100");
  const [frequency, setFrequency] = useState<Frequency>("monthly");
  const [dueDay, setDueDay] = useState("");
  const [payoutDay, setPayoutDay] = useState("");
  const [graceInput, setGraceInput] = useState("3");
  const [feeInput, setFeeInput] = useState("10");
  const [organizer, setOrganizer] = useState("");
  const [methods, setMethods] = useState("");
  const [refund, setRefund] = useState<Refund>("end");
  const [copied, setCopied] = useState(false);

  const members = Math.max(2, Math.floor(Number(membersInput)) || 2);
  const quota = Math.max(0, Number(quotaInput) || 0);
  const grace = Math.max(0, Math.floor(Number(graceInput)) || 0);
  const fee = Math.max(0, Number(feeInput) || 0);
  const money = new Intl.NumberFormat(dateLocale, { style: "currency", currency: "USD", minimumFractionDigits: 0 });

  // Empty fields fall back to the placeholder shown in the input.
  const organizerName = organizer.trim() || l.defaults.organizer;
  const values = {
    club: club.trim() || l.defaults.club,
    members,
    quota: money.format(quota),
    pot: money.format(members * quota),
    frequency: l.frequencies[frequency],
    dueDay: dueDay.trim() || l.defaults.dueDay,
    payoutDay: payoutDay.trim() || l.defaults.payoutDay,
    grace,
    fee: money.format(fee),
    organizer: organizerName,
    Organizer: capitalize(organizerName),
    methods: methods.trim() || l.defaults.methods,
    refund: l.refunds[refund],
  };

  const lateClause = fee > 0 ? l.clauses.lateWithFee : grace > 0 ? l.clauses.lateWithGrace : l.clauses.lateSimple;
  const clauses = [
    l.clauses.numbers,
    l.clauses.dates,
    l.clauses.commitment,
    lateClause,
    l.clauses.payments,
    l.clauses.turns,
    l.clauses.leaving,
    l.clauses.stopping,
    l.clauses.record,
    l.clauses.other,
    // Spanish contracts "a el" ("a el organizador" → "al organizador").
  ].map((clause) => interpolate(clause, values).replace(/\ba el\b/g, "al"));
  const heading = interpolate(l.heading, values);

  async function copyAgreement() {
    const text = [heading, "", ...clauses.map((clause, i) => `${i + 1}. ${clause}`), "", l.signature].join("\n");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col gap-8">
      <form
        className="grid gap-4 rounded-lg border p-5 sm:grid-cols-2 print:hidden"
        onSubmit={(event) => event.preventDefault()}
      >
        <Field id={`${id}-club`} label={l.fields.club} className="sm:col-span-2">
          <Input
            id={`${id}-club`}
            value={club}
            placeholder={l.defaults.club}
            onChange={(event) => setClub(event.target.value)}
          />
        </Field>
        <Field id={`${id}-members`} label={l.fields.members}>
          <Input
            id={`${id}-members`}
            type="number"
            inputMode="numeric"
            min={2}
            value={membersInput}
            onChange={(event) => setMembersInput(event.target.value)}
          />
        </Field>
        <Field id={`${id}-quota`} label={l.fields.quota}>
          <Input
            id={`${id}-quota`}
            type="number"
            inputMode="decimal"
            min={0}
            step="any"
            value={quotaInput}
            onChange={(event) => setQuotaInput(event.target.value)}
          />
        </Field>
        <Field id={`${id}-frequency`} label={l.fields.frequency} className="sm:col-span-2">
          <select
            id={`${id}-frequency`}
            className={SELECT_CLASS}
            value={frequency}
            onChange={(event) => setFrequency(event.target.value as Frequency)}
          >
            <option value="weekly">{capitalize(l.frequencies.weekly)}</option>
            <option value="biweekly">{capitalize(l.frequencies.biweekly)}</option>
            <option value="monthly">{capitalize(l.frequencies.monthly)}</option>
          </select>
        </Field>
        <Field id={`${id}-due`} label={l.fields.dueDay}>
          <Input
            id={`${id}-due`}
            value={dueDay}
            placeholder={l.defaults.dueDay}
            onChange={(event) => setDueDay(event.target.value)}
          />
        </Field>
        <Field id={`${id}-payout`} label={l.fields.payoutDay}>
          <Input
            id={`${id}-payout`}
            value={payoutDay}
            placeholder={l.defaults.payoutDay}
            onChange={(event) => setPayoutDay(event.target.value)}
          />
        </Field>
        <Field id={`${id}-grace`} label={l.fields.graceDays}>
          <Input
            id={`${id}-grace`}
            type="number"
            inputMode="numeric"
            min={0}
            value={graceInput}
            onChange={(event) => setGraceInput(event.target.value)}
          />
        </Field>
        <Field id={`${id}-fee`} label={l.fields.lateFee}>
          <Input
            id={`${id}-fee`}
            type="number"
            inputMode="decimal"
            min={0}
            step="any"
            value={feeInput}
            onChange={(event) => setFeeInput(event.target.value)}
          />
        </Field>
        <Field id={`${id}-organizer`} label={l.fields.organizer}>
          <Input
            id={`${id}-organizer`}
            value={organizer}
            placeholder={l.defaults.organizer}
            onChange={(event) => setOrganizer(event.target.value)}
          />
        </Field>
        <Field id={`${id}-methods`} label={l.fields.methods}>
          <Input
            id={`${id}-methods`}
            value={methods}
            placeholder={l.defaults.methods}
            onChange={(event) => setMethods(event.target.value)}
          />
        </Field>
        <Field id={`${id}-refund`} label={l.fields.refund} className="sm:col-span-2">
          <select
            id={`${id}-refund`}
            className={SELECT_CLASS}
            value={refund}
            onChange={(event) => setRefund(event.target.value as Refund)}
          >
            <option value="end">{capitalize(l.refunds.end)}</option>
            <option value="now">{capitalize(l.refunds.now)}</option>
          </select>
        </Field>
      </form>

      <section className="flex flex-col gap-4 rounded-lg border p-5" aria-live="polite">
        <h2 className="text-xl font-semibold tracking-tight">{heading}</h2>
        <ol className="flex list-decimal flex-col gap-3 pl-5 leading-relaxed text-muted-foreground">
          {clauses.map((clause, i) => (
            <li key={i}>{clause}</li>
          ))}
        </ol>
        <p className="text-muted-foreground">{l.signature}</p>
      </section>

      <div className="flex flex-wrap gap-3 print:hidden">
        <Button size="lg" onClick={copyAgreement}>
          {copied ? <Check /> : <Copy />}
          {copied ? l.copied : l.copy}
        </Button>
        <Button size="lg" variant="outline" onClick={() => window.print()}>
          <Printer />
          {l.print}
        </Button>
      </div>
    </div>
  );
}

function Field({
  id,
  label,
  className,
  children,
}: {
  id: string;
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`flex flex-col gap-2 ${className ?? ""}`}>
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  );
}
