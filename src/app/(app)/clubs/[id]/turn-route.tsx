import type { ReactNode } from "react";

type RouteMember = {
  id: string;
  initials: string;
  turn: number;
  isCurrent: boolean;
  isDone: boolean;
};

// Half the width of the largest stop (the 36px current-turn circle), so it
// never spills past the track's edges at turn 1 or the final turn.
const INSET = "18px";

export function TurnRoute({
  members,
  currentTurn,
  clubName,
  headline,
  poolLabel,
  payoutDateLabel,
  action,
}: {
  members: RouteMember[];
  currentTurn: number | null;
  clubName: string;
  headline: string;
  poolLabel: string;
  payoutDateLabel: string;
  action?: ReactNode;
}) {
  const total = members.length;
  const progressTurn = currentTurn ?? members.filter((m) => m.isDone).length;

  return (
    <div className="flex flex-col gap-7">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold tracking-wide text-emerald-200 uppercase">{clubName}</p>
          <p className="mt-1 text-lg font-bold text-white">{headline}</p>
        </div>
        <div className="text-right text-sm text-white/80">
          <p>{poolLabel}</p>
          <p>{payoutDateLabel}</p>
        </div>
      </div>

      {total > 0 && (
        <div className="relative h-12">
          <div className="absolute top-4 h-[3px] rounded-full bg-white/20" style={{ left: INSET, right: INSET }} />
          {total > 1 && (
            <div
              className="absolute top-4 h-[3px] rounded-full bg-white"
              style={{ left: INSET, width: `calc(${(progressTurn - 1) / (total - 1)} * (100% - 2 * ${INSET}))` }}
            />
          )}
          {members.map((member) => {
            const pct = total > 1 ? (member.turn - 1) / (total - 1) : 0.5;
            return (
              <div key={member.id} className="absolute top-0" style={{ left: `calc(${INSET} + ${pct} * (100% - 2 * ${INSET}))` }}>
                <div
                  className={
                    member.isCurrent
                      ? "absolute -top-2.5 left-1/2 flex h-9 w-9 -translate-x-1/2 items-center justify-center rounded-full bg-white text-[11px] font-bold text-emerald-800 ring-4 ring-white/25"
                      : member.isDone
                        ? "absolute top-[3px] left-1/2 flex h-[26px] w-[26px] -translate-x-1/2 items-center justify-center rounded-full border-2 border-amber-300 bg-white/10 text-[10px] font-bold text-amber-300"
                        : "absolute top-[3px] left-1/2 flex h-[26px] w-[26px] -translate-x-1/2 items-center justify-center rounded-full border-2 border-white/30 bg-white/10 text-[10px] font-bold text-white/70"
                  }
                >
                  {member.initials}
                </div>
                <span className="absolute top-9 left-1/2 -translate-x-1/2 text-[11px] whitespace-nowrap text-white/70">
                  {member.turn}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {action && <div>{action}</div>}
    </div>
  );
}
