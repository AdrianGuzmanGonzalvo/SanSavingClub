"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CreditCard, Eye, Landmark, Loader2, Save, ShieldAlert, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useI18n } from "@/lib/i18n/i18n-provider";
import { updateClubSettingsAction } from "../../actions";
import type { DurationUnit } from "@prisma/client";

export interface ClubSettingsValues {
  name: string;
  quotaAmount: number;
  durationUnit: DurationUnit;
  durationCount: number;
  paymentDueDay: number;
  payoutDay: number;
  lateFeeAmount: number;
  gracePeriodDays: number;
  adminZelleInfo: string;
  adminCashAppInfo: string;
  adminBankInfo: string;
  allowMembersToViewOtherPayments: boolean;
  isActive: boolean;
}

export function ClubSettingsForm({
  clubId,
  initial,
  canEdit,
}: {
  clubId: string;
  initial: ClubSettingsValues;
  canEdit: boolean;
}) {
  const { dict: t } = useI18n();
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<FormData | null>(null);

  const [paymentDueDay, setPaymentDueDay] = useState(String(initial.paymentDueDay));
  const [payoutDay, setPayoutDay] = useState(String(initial.payoutDay));
  const [allowViewOthers, setAllowViewOthers] = useState(initial.allowMembersToViewOtherPayments);

  const dayBounds = initial.durationUnit === "WEEK" ? { min: 0, max: 6 } : { min: 1, max: 31 };

  function submit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await updateClubSettingsAction(clubId, {}, formData);
      if (result.error) {
        setError(result.error);
        toast.error(result.error);
      } else {
        toast.success(t.clubs.admin.settingsSavedToast);
        router.refresh();
      }
    });
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const scheduleChanged =
      Number(formData.get("paymentDueDay")) !== initial.paymentDueDay ||
      Number(formData.get("payoutDay")) !== initial.payoutDay;

    if (scheduleChanged) {
      setPendingFormData(formData);
      setConfirmOpen(true);
    } else {
      submit(formData);
    }
  }

  function handleConfirm() {
    setConfirmOpen(false);
    if (pendingFormData) submit(pendingFormData);
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldAlert className="h-4 w-4 text-primary" />
            {t.clubs.admin.settingsTitle}
          </CardTitle>
          <CardDescription>{t.clubs.admin.settingsSubtitle}</CardDescription>
        </CardHeader>
        <CardContent>
          <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">{t.clubs.new.name}</Label>
              <Input id="name" name="name" defaultValue={initial.name} disabled={!canEdit} required />
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
                  defaultValue={initial.quotaAmount}
                  disabled={!canEdit}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="durationCount">{t.clubs.new.duration}</Label>
                <Input
                  id="durationCount"
                  name="durationCount"
                  type="number"
                  min="1"
                  max="52"
                  defaultValue={initial.durationCount}
                  disabled={!canEdit}
                  required
                />
              </div>
            </div>
            {initial.isActive && (
              <p className="-mt-2 text-xs text-muted-foreground">{t.clubs.admin.durationCountActiveHint}</p>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="paymentDueDay">{t.clubs.new.paymentDueDay}</Label>
                {initial.durationUnit === "WEEK" ? (
                  <input type="hidden" name="paymentDueDay" value={paymentDueDay} />
                ) : null}
                {initial.durationUnit === "WEEK" ? (
                  <Select value={paymentDueDay} onValueChange={setPaymentDueDay} disabled={!canEdit}>
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
                    name="paymentDueDay"
                    type="number"
                    min={dayBounds.min}
                    max={dayBounds.max}
                    value={paymentDueDay}
                    onChange={(e) => setPaymentDueDay(e.target.value)}
                    disabled={!canEdit}
                    required
                  />
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="payoutDay">{t.clubs.new.payoutDay}</Label>
                {initial.durationUnit === "WEEK" ? (
                  <input type="hidden" name="payoutDay" value={payoutDay} />
                ) : null}
                {initial.durationUnit === "WEEK" ? (
                  <Select value={payoutDay} onValueChange={setPayoutDay} disabled={!canEdit}>
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
                    name="payoutDay"
                    type="number"
                    min={dayBounds.min}
                    max={dayBounds.max}
                    value={payoutDay}
                    onChange={(e) => setPayoutDay(e.target.value)}
                    disabled={!canEdit}
                    required
                  />
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="lateFeeAmount">{t.clubs.new.lateFeeAmount}</Label>
                <Input
                  id="lateFeeAmount"
                  name="lateFeeAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  defaultValue={initial.lateFeeAmount}
                  disabled={!canEdit}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="gracePeriodDays">{t.clubs.admin.gracePeriodDays}</Label>
                <Input
                  id="gracePeriodDays"
                  name="gracePeriodDays"
                  type="number"
                  min="0"
                  max="30"
                  defaultValue={initial.gracePeriodDays}
                  disabled={!canEdit}
                />
              </div>
            </div>
            <p className="-mt-2 text-xs text-muted-foreground">{t.clubs.admin.gracePeriodHint}</p>

            <div className="flex flex-col gap-3 border-t pt-4">
              <div>
                <p className="text-sm font-medium">{t.clubs.admin.paymentInstructionsTitle}</p>
                <p className="text-xs text-muted-foreground">{t.clubs.admin.paymentInstructionsHint}</p>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="adminZelleInfo" className="flex items-center gap-1.5">
                  <Smartphone className="h-3.5 w-3.5" /> {t.clubs.admin.zelleLabel}
                </Label>
                <Input id="adminZelleInfo" name="adminZelleInfo" defaultValue={initial.adminZelleInfo} disabled={!canEdit} />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="adminCashAppInfo" className="flex items-center gap-1.5">
                  <CreditCard className="h-3.5 w-3.5" /> {t.clubs.admin.cashAppLabel}
                </Label>
                <Input
                  id="adminCashAppInfo"
                  name="adminCashAppInfo"
                  defaultValue={initial.adminCashAppInfo}
                  disabled={!canEdit}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="adminBankInfo" className="flex items-center gap-1.5">
                  <Landmark className="h-3.5 w-3.5" /> {t.clubs.admin.bankLabel}
                </Label>
                <Input id="adminBankInfo" name="adminBankInfo" defaultValue={initial.adminBankInfo} disabled={!canEdit} />
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t pt-4">
              <div>
                <p className="flex items-center gap-1.5 text-sm font-medium">
                  <Eye className="h-3.5 w-3.5" /> {t.clubs.admin.privacyTitle}
                </p>
              </div>
              <input type="hidden" name="allowMembersToViewOtherPayments" value={allowViewOthers ? "true" : "false"} />
              <div className="flex items-center justify-between gap-3 rounded-md border p-3">
                <div className="flex flex-col gap-0.5">
                  <Label htmlFor="allowMembersToViewOtherPayments">{t.clubs.admin.allowViewOtherPaymentsLabel}</Label>
                  <p className="text-xs text-muted-foreground">{t.clubs.admin.allowViewOtherPaymentsHint}</p>
                </div>
                <Switch
                  id="allowMembersToViewOtherPayments"
                  checked={allowViewOthers}
                  onCheckedChange={setAllowViewOthers}
                  disabled={!canEdit}
                />
              </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" disabled={!canEdit || isPending} className="mt-2 self-start">
              {isPending ? <Loader2 className="animate-spin" /> : <Save />}
              {isPending ? t.clubs.admin.savingSettings : t.clubs.admin.saveSettings}
            </Button>
          </form>
        </CardContent>
      </Card>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.clubs.admin.confirmScheduleChangeTitle}</AlertDialogTitle>
            <AlertDialogDescription>{t.clubs.admin.confirmScheduleChangeDescription}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>{t.clubs.admin.confirmScheduleChangeButton}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
