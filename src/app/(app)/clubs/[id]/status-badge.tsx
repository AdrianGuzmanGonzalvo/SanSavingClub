import { cn } from "@/lib/utils";
import type { MemberDisplayStatus } from "@/lib/club";
import type { Dictionary } from "@/lib/i18n/dictionaries";

const STATUS_CONFIG: Record<MemberDisplayStatus, string> = {
  PAID: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  REPORTED: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  OVERDUE: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300",
  UPCOMING: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
};

export function MemberStatusBadge({ status, t }: { status: MemberDisplayStatus; t: Dictionary }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-lg px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase",
        STATUS_CONFIG[status]
      )}
    >
      {t.clubs.detail.status[status]}
    </span>
  );
}
