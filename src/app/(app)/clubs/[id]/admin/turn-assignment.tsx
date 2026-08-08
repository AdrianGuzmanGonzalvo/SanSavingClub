"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle2, Shuffle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useI18n } from "@/lib/i18n/i18n-provider";
import { interpolate } from "@/lib/i18n/format";
import { assignTurnAction, randomizeTurnsAction, removeMemberAction } from "../../actions";

function initials(name: string) {
  return name.split(" ").map((p) => p[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
}

interface MemberRow {
  id: string;
  userId: string;
  fullName: string;
  payoutTurn: number | null;
  isAdmin: boolean;
  payoutPaid: boolean;
}

export function TurnAssignmentSection({
  clubId,
  members,
  durationCount,
  isPending,
  canEditTurns,
}: {
  clubId: string;
  members: MemberRow[];
  durationCount: number;
  isPending: boolean;
  canEditTurns: boolean;
}) {
  const { dict: t } = useI18n();

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="text-base">{t.clubs.admin.turnsTitle}</CardTitle>
          <CardDescription>{t.clubs.admin.turnsSubtitle}</CardDescription>
        </div>
        {isPending && <RandomizeTurnsButton clubId={clubId} />}
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {members.map((member) => (
          <div key={member.id} className="flex items-center justify-between gap-3 rounded-md border p-2">
            <div className="flex items-center gap-2">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="text-xs">{initials(member.fullName)}</AvatarFallback>
              </Avatar>
              <span className="text-sm">
                {member.fullName}
                {member.isAdmin && (
                  <span className="ml-1.5 rounded-full bg-indigo-100 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                    {t.clubs.detail.adminTag}
                  </span>
                )}
                {member.payoutPaid && (
                  <span className="ml-1.5 inline-flex items-center gap-0.5 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    <CheckCircle2 className="h-2.5 w-2.5" /> {t.clubs.detail.payoutReceivedTag}
                  </span>
                )}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <TurnSelect
                clubId={clubId}
                memberId={member.id}
                currentTurn={member.payoutTurn}
                durationCount={durationCount}
                disabled={!canEditTurns}
              />
              {isPending && !member.isAdmin && (
                <RemoveMemberButton clubId={clubId} memberId={member.id} memberName={member.fullName} />
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function TurnSelect({
  clubId,
  memberId,
  currentTurn,
  durationCount,
  disabled,
}: {
  clubId: string;
  memberId: string;
  currentTurn: number | null;
  durationCount: number;
  disabled: boolean;
}) {
  const { dict: t } = useI18n();
  const router = useRouter();
  const [isSaving, startTransition] = useTransition();

  function handleChange(value: string) {
    const turn = value === "unassigned" ? null : Number(value);
    startTransition(async () => {
      const result = await assignTurnAction(clubId, memberId, turn);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(t.clubs.admin.turnSavedToast);
        router.refresh();
      }
    });
  }

  return (
    <Select
      value={currentTurn ? String(currentTurn) : "unassigned"}
      onValueChange={handleChange}
      disabled={disabled || isSaving}
    >
      <SelectTrigger className="w-36">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="unassigned">{t.clubs.admin.unassignedOption}</SelectItem>
        {Array.from({ length: durationCount }, (_, i) => i + 1).map((turn) => (
          <SelectItem key={turn} value={String(turn)}>
            #{turn}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function RandomizeTurnsButton({ clubId }: { clubId: string }) {
  const { dict: t } = useI18n();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      const result = await randomizeTurnsAction(clubId);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(t.clubs.admin.randomizedToast);
        router.refresh();
      }
    });
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="special" size="sm" disabled={isPending}>
          <Shuffle className="h-4 w-4" /> {t.clubs.admin.randomize}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t.clubs.admin.randomizeConfirmTitle}</AlertDialogTitle>
          <AlertDialogDescription>{t.clubs.admin.randomizeConfirmDescription}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm}>{t.clubs.admin.randomizeConfirmButton}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function RemoveMemberButton({
  clubId,
  memberId,
  memberName,
}: {
  clubId: string;
  memberId: string;
  memberName: string;
}) {
  const { dict: t } = useI18n();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!window.confirm(interpolate(t.clubs.detail.removeConfirm, { name: memberName }))) return;
    startTransition(async () => {
      const result = await removeMemberAction(clubId, memberId);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(interpolate(t.clubs.detail.removedToast, { name: memberName }));
        router.refresh();
      }
    });
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          size="icon-sm"
          variant="ghost"
          onClick={handleClick}
          disabled={isPending}
          aria-label={t.clubs.detail.remove}
          className="text-muted-foreground hover:text-destructive"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{t.clubs.detail.remove}</TooltipContent>
    </Tooltip>
  );
}
