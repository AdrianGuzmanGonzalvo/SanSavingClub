"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Send, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useI18n } from "@/lib/i18n/i18n-provider";
import { interpolate } from "@/lib/i18n/format";
import { formatUSD } from "@/lib/format";
import { showInterstitialAd } from "@/components/native-admob";
import { submitPaymentReportAction, type PaymentReportFormState } from "../../actions";

const MAX_RECEIPT_BYTES = 2 * 1024 * 1024;
const METHODS = ["ZELLE", "CASH_APP", "BANK_TRANSFER", "CASH", "OTHER"] as const;

function todayInputValue(): string {
  return new Date().toISOString().slice(0, 10);
}

export function PayForm({
  clubId,
  quotaAmount,
  lateFeeAmount,
  paymentDueDay,
}: {
  clubId: string;
  quotaAmount: number;
  lateFeeAmount: number;
  paymentDueDay: number;
}) {
  const { dict: t } = useI18n();
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [paymentDate, setPaymentDate] = useState(todayInputValue());
  const [receiptDataUrl, setReceiptDataUrl] = useState<string | null>(null);
  const [receiptFilename, setReceiptFilename] = useState<string | null>(null);

  const isLate = useMemo(() => {
    const selected = new Date(paymentDate);
    const dueThisMonth = new Date(selected.getFullYear(), selected.getMonth(), paymentDueDay);
    return selected > dueThisMonth;
  }, [paymentDate, paymentDueDay]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_RECEIPT_BYTES) {
      toast.error("File is too large (max 2MB).");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setReceiptDataUrl(reader.result as string);
      setReceiptFilename(file.name);
    };
    reader.readAsDataURL(file);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result: PaymentReportFormState = await submitPaymentReportAction(clubId, {}, formData);
      if (result.error) {
        setError(result.error);
        toast.error(result.error);
      } else {
        toast.success(t.clubs.pay.successToast);
        router.push(`/clubs/${clubId}`);
        router.refresh();
        showInterstitialAd();
      }
    });
  }

  return (
    <Card className="gap-0 overflow-hidden py-0">
      <CardHeader className="relative overflow-hidden gap-1 border-b bg-gradient-to-br from-emerald-600 via-teal-700 to-indigo-800 py-5 text-white">
        <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
        <CardTitle className="relative text-white">{t.clubs.pay.title}</CardTitle>
        <CardDescription className="relative text-white/80">{t.clubs.pay.subtitle}</CardDescription>
      </CardHeader>
      <CardContent className="py-4">
        <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input type="hidden" name="receiptDataUrl" value={receiptDataUrl ?? ""} />

          <div className="flex flex-col gap-2">
            <Label htmlFor="amount">{t.clubs.pay.amount}</Label>
            <Input id="amount" name="amount" type="number" min="0.01" step="0.01" defaultValue={quotaAmount} required />
            <p className="text-xs text-muted-foreground">
              {interpolate(t.clubs.pay.suggestedAmount, { amount: formatUSD(quotaAmount) })}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="paymentDate">{t.clubs.pay.paymentDate}</Label>
            <Input
              id="paymentDate"
              name="paymentDate"
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              required
            />
            {isLate && lateFeeAmount > 0 && (
              <p className="text-xs text-amber-600 dark:text-amber-400">
                {interpolate(t.clubs.pay.lateFeeNotice, {
                  fee: formatUSD(lateFeeAmount),
                  total: formatUSD(quotaAmount + lateFeeAmount),
                })}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="method">{t.clubs.pay.method}</Label>
            <Select name="method" required>
              <SelectTrigger id="method" className="w-full">
                <SelectValue placeholder={t.clubs.pay.selectMethod} />
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
            <Label htmlFor="referenceNote">
              {t.clubs.pay.referenceNote} <span className="text-muted-foreground">({t.common.optional})</span>
            </Label>
            <Textarea id="referenceNote" name="referenceNote" placeholder={t.clubs.pay.referenceNotePlaceholder} />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="receipt">
              {t.clubs.pay.receipt} <span className="text-muted-foreground">({t.common.optional})</span>
            </Label>
            <label
              htmlFor="receipt"
              className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed px-3 py-2 text-sm text-muted-foreground hover:border-primary hover:text-foreground"
            >
              <Upload className="h-4 w-4" />
              {receiptFilename ? interpolate(t.clubs.pay.receiptSelected, { filename: receiptFilename }) : t.clubs.pay.receiptHint}
            </label>
            <input id="receipt" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            <p className="text-xs text-muted-foreground">{t.clubs.pay.receiptDisclaimer}</p>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" disabled={isPending} className="mt-2">
            {isPending ? <Loader2 className="animate-spin" /> : <Send />}
            {isPending ? t.clubs.pay.submitting : t.clubs.pay.submit}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
