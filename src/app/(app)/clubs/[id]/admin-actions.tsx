"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/i18n-provider";
import { activateClubAction } from "../actions";

export function ActivateClubButton({ clubId }: { clubId: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { dict: t } = useI18n();

  function handleClick() {
    startTransition(async () => {
      const result = await activateClubAction(clubId);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(t.clubs.detail.activatedToast);
        router.refresh();
      }
    });
  }

  return (
    <Button onClick={handleClick} disabled={isPending}>
      {isPending ? <Loader2 className="animate-spin" /> : <PlayCircle />}
      {isPending ? t.clubs.detail.activating : t.clubs.detail.activateClub}
    </Button>
  );
}
