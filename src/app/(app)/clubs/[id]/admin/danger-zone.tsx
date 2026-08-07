"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { cancelClubAction } from "../../actions";

export function DangerZone({ clubId, canDeactivate }: { clubId: string; canDeactivate: boolean }) {
  const { dict: t } = useI18n();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      const result = await cancelClubAction(clubId);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(t.clubs.admin.deactivatedToast);
        router.push("/dashboard");
      }
    });
  }

  if (!canDeactivate) return null;

  return (
    <Card className="border-rose-300 dark:border-rose-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base text-rose-700 dark:text-rose-400">
          <TriangleAlert className="h-4 w-4" />
          {t.clubs.admin.dangerZoneTitle}
        </CardTitle>
        <CardDescription>{t.clubs.admin.dangerZoneDescription}</CardDescription>
      </CardHeader>
      <CardContent>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" disabled={isPending} className="border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-400 dark:hover:bg-rose-950">
              {isPending ? <Loader2 className="animate-spin" /> : <TriangleAlert />}
              {isPending ? t.clubs.admin.deactivating : t.clubs.admin.deactivateClub}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t.clubs.admin.confirmDeactivateTitle}</AlertDialogTitle>
              <AlertDialogDescription>{t.clubs.admin.confirmDeactivateDescription}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirm} className="bg-rose-600 text-white hover:bg-rose-700">
                {t.clubs.admin.confirmDeactivateButton}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
