"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle2, Copy, KeyRound, Loader2, ShieldCheck, ShieldOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/password-input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useI18n } from "@/lib/i18n/i18n-provider";
import {
  confirmTwoFactorSetupAction,
  disableTwoFactorAction,
  startTwoFactorSetupAction,
} from "../actions";

type SetupStep = "closed" | "scan" | "backupCodes";

export function TwoFactorSection({ enabled }: { enabled: boolean }) {
  const { dict: t } = useI18n();
  const router = useRouter();
  const [step, setStep] = useState<SetupStep>("closed");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [secret, setSecret] = useState("");
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");
  const [code, setCode] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [disableError, setDisableError] = useState<string | null>(null);

  function handleStart() {
    setError(null);
    startTransition(async () => {
      const result = await startTwoFactorSetupAction();
      if (result.error || !result.secret || !result.qrCodeDataUrl) {
        toast.error(result.error ?? t.profile.errors.twoFactorSetupFailed);
        return;
      }
      setSecret(result.secret);
      setQrCodeDataUrl(result.qrCodeDataUrl);
      setCode("");
      setStep("scan");
    });
  }

  function handleConfirm() {
    setError(null);
    startTransition(async () => {
      const result = await confirmTwoFactorSetupAction(secret, code);
      if (result.error || !result.backupCodes) {
        setError(result.error ?? t.profile.errors.twoFactorSetupFailed);
        return;
      }
      setBackupCodes(result.backupCodes);
      setStep("backupCodes");
    });
  }

  function handleFinish() {
    setStep("closed");
    toast.success(t.profile.twoFactorEnabledToast);
    router.refresh();
  }

  function handleDisable(formData: FormData) {
    setDisableError(null);
    startTransition(async () => {
      const result = await disableTwoFactorAction({}, formData);
      if (result.error) {
        setDisableError(result.error);
        toast.error(result.error);
      } else {
        toast.success(t.profile.twoFactorDisabledToast);
        router.refresh();
      }
    });
  }

  function copyBackupCodes() {
    navigator.clipboard.writeText(backupCodes.join("\n"));
    toast.success(t.profile.backupCodesCopiedToast);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3 rounded-md border p-3">
        <div className="flex items-center gap-2">
          {enabled ? (
            <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <ShieldOff className="h-4 w-4 text-muted-foreground" />
          )}
          <div className="flex flex-col">
            <span className="text-sm font-medium">
              {enabled ? t.profile.twoFactorEnabledLabel : t.profile.twoFactorDisabledLabel}
            </span>
            <span className="text-xs text-muted-foreground">{t.profile.twoFactorDescription}</span>
          </div>
        </div>

        {enabled ? (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm">
                {t.profile.disableTwoFactor}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t.profile.disableTwoFactorConfirmTitle}</AlertDialogTitle>
                <AlertDialogDescription>{t.profile.disableTwoFactorConfirmDescription}</AlertDialogDescription>
              </AlertDialogHeader>
              <form action={handleDisable} className="flex flex-col gap-2">
                <Label htmlFor="disablePassword">{t.profile.currentPasswordLabel}</Label>
                <PasswordInput id="disablePassword" name="password" required autoComplete="current-password" />
                {disableError && <p className="text-sm text-destructive">{disableError}</p>}
                <AlertDialogFooter className="mt-2">
                  <AlertDialogCancel type="button">{t.common.cancel}</AlertDialogCancel>
                  <Button type="submit" variant="destructive" disabled={isPending}>
                    {isPending ? <Loader2 className="animate-spin" /> : null}
                    {t.profile.disableTwoFactor}
                  </Button>
                </AlertDialogFooter>
              </form>
            </AlertDialogContent>
          </AlertDialog>
        ) : (
          <Button size="sm" onClick={handleStart} disabled={isPending}>
            {isPending ? <Loader2 className="animate-spin" /> : <KeyRound />}
            {t.profile.enableTwoFactor}
          </Button>
        )}
      </div>

      <Dialog open={step === "scan"} onOpenChange={(open) => !open && setStep("closed")}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.profile.twoFactorSetupTitle}</DialogTitle>
            <DialogDescription>{t.profile.twoFactorSetupDescription}</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-3">
            {qrCodeDataUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={qrCodeDataUrl} alt="QR code" className="h-48 w-48 rounded-md border" />
            )}
            <p className="break-all text-center text-xs text-muted-foreground">{secret}</p>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="twoFactorCode">{t.profile.twoFactorCodeLabel}</Label>
            <Input
              id="twoFactorCode"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="123456"
              inputMode="numeric"
              autoFocus
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStep("closed")}>
              {t.common.cancel}
            </Button>
            <Button onClick={handleConfirm} disabled={isPending || code.length < 6}>
              {isPending ? <Loader2 className="animate-spin" /> : null}
              {t.profile.confirmTwoFactorCode}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={step === "backupCodes"} onOpenChange={() => {}}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.profile.backupCodesTitle}</DialogTitle>
            <DialogDescription>{t.profile.backupCodesDescription}</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-2 rounded-md border bg-muted p-3 font-mono text-sm">
            {backupCodes.map((c) => (
              <span key={c}>{c}</span>
            ))}
          </div>
          <Button variant="outline" onClick={copyBackupCodes} className="self-start">
            <Copy className="h-3.5 w-3.5" /> {t.profile.copyBackupCodes}
          </Button>
          <DialogFooter>
            <Button onClick={handleFinish}>
              <CheckCircle2 /> {t.profile.savedBackupCodes}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
