"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Pause, Play, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useI18n } from "@/lib/i18n/i18n-provider";
import { interpolate } from "@/lib/i18n/format";
import { pauseClubAction, reactivateClubAction, resumeClubAction } from "../../actions";
import type { ClubStatus } from "@prisma/client";

export function LifecycleControls({
  clubId,
  status,
  roundNumber,
}: {
  clubId: string;
  status: ClubStatus;
  roundNumber: number;
}) {
  const { dict: t } = useI18n();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function run(action: () => Promise<{ error?: string }>, successMessage: string) {
    startTransition(async () => {
      const result = await action();
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(successMessage);
        router.refresh();
      }
    });
  }

  if (status === "ACTIVE") {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline" disabled={isPending}>
            {isPending ? <Loader2 className="animate-spin" /> : <Pause />}
            {t.clubs.admin.pauseClub}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.clubs.admin.confirmPauseTitle}</AlertDialogTitle>
            <AlertDialogDescription>{t.clubs.admin.confirmPauseDescription}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={() => run(() => pauseClubAction(clubId), t.clubs.admin.pausedToast)}>
              {t.clubs.admin.confirmPauseButton}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  if (status === "PAUSED") {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          disabled={isPending}
          onClick={() => run(() => resumeClubAction(clubId), t.clubs.admin.resumedToast)}
        >
          {isPending ? <Loader2 className="animate-spin" /> : <Play />}
          {t.clubs.admin.resumeClub}
        </Button>
        <ReactivateButton clubId={clubId} roundNumber={roundNumber} />
      </div>
    );
  }

  if (status === "COMPLETED") {
    return <ReactivateButton clubId={clubId} roundNumber={roundNumber} />;
  }

  return null;
}

function ReactivateButton({ clubId, roundNumber }: { clubId: string; roundNumber: number }) {
  const { dict: t } = useI18n();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      const result = await reactivateClubAction(clubId);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(t.clubs.admin.reactivatedToast);
        router.refresh();
      }
    });
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="special" disabled={isPending}>
          {isPending ? <Loader2 className="animate-spin" /> : <RefreshCw />}
          {t.clubs.admin.reactivate}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t.clubs.admin.confirmReactivateTitle}</AlertDialogTitle>
          <AlertDialogDescription>
            {interpolate(t.clubs.admin.confirmReactivateDescription, { round: roundNumber + 1 })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm}>{t.clubs.admin.confirmReactivateButton}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
