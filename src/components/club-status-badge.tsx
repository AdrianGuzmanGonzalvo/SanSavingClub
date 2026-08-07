import { Badge } from "@/components/ui/badge";
import type { ClubStatus } from "@prisma/client";
import type { Dictionary } from "@/lib/i18n/dictionaries";

const STATUS_CLASSES: Record<ClubStatus, string> = {
  ACTIVE: "border-emerald-300 bg-emerald-100 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  PENDING: "border-amber-300 bg-amber-100 text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300",
  PAUSED: "border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300",
  COMPLETED: "border-indigo-300 bg-indigo-100 text-indigo-800 dark:border-indigo-800 dark:bg-indigo-950 dark:text-indigo-300",
  CANCELLED: "border-rose-300 bg-rose-100 text-rose-800 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-300",
};

export function ClubStatusBadge({ status, t }: { status: ClubStatus; t: Dictionary }) {
  return (
    <Badge variant="outline" className={`gap-1.5 font-semibold ${STATUS_CLASSES[status]}`}>
      {status === "ACTIVE" && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
        </span>
      )}
      {t.common.clubStatus[status]}
    </Badge>
  );
}
