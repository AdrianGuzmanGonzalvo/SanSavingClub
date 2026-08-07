import { Badge } from "@/components/ui/badge";
import type { MemberDisplayStatus } from "@/lib/club";
import type { Dictionary } from "@/lib/i18n/dictionaries";

const STATUS_CONFIG: Record<MemberDisplayStatus, { dot: string; className: string }> = {
  PAID: { dot: "🟢", className: "bg-emerald-100 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300" },
  REPORTED: { dot: "🟡", className: "bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-950 dark:text-amber-300" },
  OVERDUE: { dot: "🔴", className: "bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-950 dark:text-red-300" },
  UPCOMING: { dot: "⚪", className: "bg-slate-100 text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300" },
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
