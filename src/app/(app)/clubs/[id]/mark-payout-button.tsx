"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle2, Loader2 } from "lucide-react";
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
import { markPayoutCompletedAction } from "../actions";

export function MarkPayoutButton({ clubId }: { clubId: string }) {
  const { dict: t } = useI18n();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      const result = await markPayoutCompletedAction(clubId);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(t.clubs.detail.payoutMarkedToast);
        router.refresh();
      }
    });
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="sm" variant="secondary" disabled={isPending} className="bg-white/15 text-white hover:bg-white/25">
          {isPending ? <Loader2 className="animate-spin" /> : <CheckCircle2 />}
          {isPending ? t.clubs.detail.markingPayout : t.clubs.detail.markPayout}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t.clubs.detail.confirmMarkPayoutTitle}</AlertDialogTitle>
          <AlertDialogDescription>{t.clubs.detail.confirmMarkPayoutDescription}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm}>{t.clubs.detail.confirmMarkPayoutButton}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
