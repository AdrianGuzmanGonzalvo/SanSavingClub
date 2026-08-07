"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useI18n } from "@/lib/i18n/i18n-provider";
import { swapMemberTurnsAction } from "../../actions";

interface MemberOption {
  id: string;
  fullName: string;
  payoutTurn: number | null;
}

export function SwapTurnsDialog({
  clubId,
  members,
  canEdit,
}: {
  clubId: string;
  members: MemberOption[];
  canEdit: boolean;
}) {
  const { dict: t } = useI18n();
  const router = useRouter();
  const [memberAId, setMemberAId] = useState<string>("");
  const [memberBId, setMemberBId] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      const result = await swapMemberTurnsAction(clubId, memberAId, memberBId);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(t.clubs.admin.swappedToast);
        setMemberAId("");
        setMemberBId("");
        router.refresh();
      }
    });
  }

  const canSwap = canEdit && memberAId && memberBId && memberAId !== memberBId;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ArrowUpDown className="h-4 w-4 text-primary" />
          {t.clubs.admin.swapTitle}
        </CardTitle>
        <CardDescription>{t.clubs.admin.swapDescription}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex flex-1 flex-col gap-2">
          <span className="text-sm text-muted-foreground">{t.clubs.admin.memberALabel}</span>
          <Select value={memberAId} onValueChange={setMemberAId} disabled={!canEdit}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {members.map((m) => (
                <SelectItem key={m.id} value={m.id} disabled={m.id === memberBId}>
                  {m.fullName} {m.payoutTurn ? `(#${m.payoutTurn})` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <span className="text-sm text-muted-foreground">{t.clubs.admin.memberBLabel}</span>
          <Select value={memberBId} onValueChange={setMemberBId} disabled={!canEdit}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {members.map((m) => (
                <SelectItem key={m.id} value={m.id} disabled={m.id === memberAId}>
                  {m.fullName} {m.payoutTurn ? `(#${m.payoutTurn})` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button disabled={!canSwap || isPending}>
              <ArrowUpDown className="h-4 w-4" /> {t.clubs.admin.swapButton}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t.clubs.admin.confirmSwapTitle}</AlertDialogTitle>
              <AlertDialogDescription>{t.clubs.admin.confirmSwapDescription}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirm}>{t.clubs.admin.confirmSwapButton}</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
