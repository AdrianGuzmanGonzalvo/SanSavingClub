import { Badge } from "@/components/ui/badge";
import type { MemberDisplayStatus } from "@/lib/club";
import type { Dictionary } from "@/lib/i18n/dictionaries";

const STATUS_CONFIG: Record<MemberDisplayStatus, { dot: string; className: string }> = {
  PAID: {
    dot: "🟢",
    className:
      "border-emerald-300 bg-emerald-100 font-semibold text-emerald-800 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  },
  REPORTED: {
    dot: "🟡",
    className:
      "border-amber-300 bg-amber-100 font-semibold text-amber-800 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300",
  },
  OVERDUE: {
    dot: "🔴",
    className:
      "border-rose-300 bg-rose-100 font-semibold text-rose-800 hover:bg-rose-100 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-300",
  },
  UPCOMING: {
    dot: "⚪",
    className: "border-slate-300 bg-slate-100 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300",
  },
};

export function MemberStatusBadge({ status, t }: { status: MemberDisplayStatus; t: Dictionary }) {
  const config = STATUS_CONFIG[status];
  return (
    <Badge variant="outline" className={config.className}>
      <span className="mr-1">{config.dot}</span>
      {t.clubs.detail.status[status]}
    </Badge>
  );
}
