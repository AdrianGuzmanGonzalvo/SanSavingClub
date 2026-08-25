import type { ReactNode } from "react";

type WheelMember = {
  id: string;
  initials: string;
  isCurrent: boolean;
};

export function TurnWheel({
  members,
  currentTurn,
  turnLabel,
  payoutName,
  payoutLabel,
  action,
}: {
  members: WheelMember[];
  currentTurn: number | null;
  turnLabel: string;
  payoutName: string;
  payoutLabel: string;
  action?: ReactNode;
}) {
  const total = members.length;

  return (
    <div className="flex flex-wrap items-center gap-5">
      <div className="relative h-32 w-32 shrink-0 sm:h-36 sm:w-36">
        <div className="absolute inset-0 motion-safe:animate-[spin_26s_linear_infinite] rounded-full border border-dashed border-white/25" />
        {members.map((member, i) => {
          const angle = total > 0 ? (i / total) * 2 * Math.PI - Math.PI / 2 : 0;
          const radius = 46;
          const top = 50 + radius * Math.sin(angle);
          const left = 50 + radius * Math.cos(angle);
          return (
            <div
              key={member.id}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ top: `${top}%`, left: `${left}%` }}
            >
              {member.isCurrent ? (
                <span className="relative flex h-10 w-10 items-center justify-center">
                  <span className="absolute inline-flex h-full w-full motion-safe:animate-[ping_2.4s_ease-out_infinite] rounded-full bg-white/50" />
                  <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white text-xs font-bold text-emerald-800">
                    {member.initials}
                  </span>
                </span>
              ) : (
                <span className="flex h-7 w-7 items-center justify-center rounded-full border border-white/30 bg-white/10 text-[10px] font-semibold text-white/70">
                  {member.initials}
                </span>
              )}
            </div>
          );
        })}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-white/70">{turnLabel}</span>
          <span className="text-2xl font-bold text-white">{currentTurn ?? "–"}</span>
        </div>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="truncate text-lg font-bold text-white">{payoutName}</p>
        <p className="text-sm text-white/80">{payoutLabel}</p>
        {action && <div className="pt-1">{action}</div>}
      </div>
    </div>
  );
}
