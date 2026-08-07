"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle2, Loader2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useI18n } from "@/lib/i18n/i18n-provider";
import { completeClubAction, submitRatingsAction } from "../../actions";

function initials(name: string) {
  return name.split(" ").map((p) => p[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
}

interface RatableMember {
  userId: string;
  fullName: string;
}

function StarRatingInput({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          aria-label={`${n} star`}
          className="text-amber-500"
        >
          <Star className={`h-5 w-5 ${n <= value ? "fill-current" : ""}`} />
        </button>
      ))}
    </div>
  );
}

export function CompleteClubDialog({
  clubId,
  members,
  canComplete,
}: {
  clubId: string;
  members: RatableMember[];
  canComplete: boolean;
}) {
  const { dict: t } = useI18n();
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [open, setOpen] = useState(false);
  const [ratings, setRatings] = useState<Record<string, number>>(() =>
    Object.fromEntries(members.map((m) => [m.userId, 5]))
  );
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const ratingsResult = await submitRatingsAction(clubId, {}, formData);
      if (ratingsResult.error) {
        toast.error(ratingsResult.error);
        return;
      }
      const completeResult = await completeClubAction(clubId);
      if (completeResult.error) {
        toast.error(completeResult.error);
        return;
      }
      toast.success(t.clubs.admin.reviewsSubmittedToast);
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={!canComplete}>
          <CheckCircle2 /> {t.clubs.admin.completeClub}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t.clubs.admin.reviewDialogTitle}</DialogTitle>
          <DialogDescription>{t.clubs.admin.reviewDialogDescription}</DialogDescription>
        </DialogHeader>
        <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4">
          {members.map((member) => (
            <div key={member.userId} className="flex flex-col gap-2 rounded-md border p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="text-xs">{initials(member.fullName)}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{member.fullName}</span>
                </div>
                <input type="hidden" name={`stars_${member.userId}`} value={ratings[member.userId]} />
                <StarRatingInput
                  value={ratings[member.userId]}
                  onChange={(n) => setRatings((prev) => ({ ...prev, [member.userId]: n }))}
                />
              </div>
              <Textarea
                name={`comment_${member.userId}`}
                placeholder={t.clubs.admin.commentPlaceholder}
                className="min-h-16"
              />
            </div>
          ))}
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? <Loader2 className="animate-spin" /> : <CheckCircle2 />}
              {isPending ? t.clubs.admin.submittingReviews : t.clubs.admin.submitReviews}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
