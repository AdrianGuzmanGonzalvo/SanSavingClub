"use client";

import { Award, Medal, Star, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useI18n } from "@/lib/i18n/i18n-provider";
import { interpolate } from "@/lib/i18n/format";
import type { TrustTier } from "@prisma/client";

export interface TrustStats {
  averageRating: number;
  trustTier: TrustTier;
  punctualityScore: number;
  completedClubsCount: number;
}

const TIER_CONFIG: Record<TrustTier, { icon: typeof Trophy; className: string }> = {
  BRONZE: {
    icon: Medal,
    className: "border-amber-800/30 bg-gradient-to-b from-amber-200 to-amber-400/70 text-amber-900 dark:border-amber-700/40 dark:from-amber-900 dark:to-amber-950 dark:text-amber-300",
  },
  SILVER: {
    icon: Award,
    className: "border-slate-400/40 bg-gradient-to-b from-slate-200 to-blue-200/70 text-slate-700 dark:border-slate-500/40 dark:from-slate-600 dark:to-slate-700 dark:text-slate-200",
  },
  GOLD: {
    icon: Trophy,
    className:
      "border-amber-400/60 bg-gradient-to-b from-amber-200 via-yellow-300 to-amber-400 text-amber-950 shadow-sm shadow-amber-500/40 ring-1 ring-amber-400/50 dark:border-amber-500/50 dark:from-amber-600 dark:via-yellow-500 dark:to-amber-600 dark:text-amber-50",
  },
};

export function UserTrustBadge({
  stats,
  variant = "compact",
}: {
  stats: TrustStats;
  variant?: "compact" | "full";
}) {
  const { dict: t } = useI18n();
  const config = TIER_CONFIG[stats.trustTier];
  const Icon = config.icon;

  if (variant === "compact") {
    return (
      <div className="flex items-center gap-1.5">
        <Badge variant="outline" className={`gap-1 ${config.className}`}>
          <Icon className="h-3 w-3" />
          {t.common.trustTiers[stats.trustTier]}
        </Badge>
        <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
          <Star className="h-3 w-3 fill-current text-amber-500" />
          {stats.averageRating.toFixed(1)}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <Badge variant="outline" className={`gap-1 ${config.className}`}>
          <Icon className="h-3.5 w-3.5" />
          {t.common.trustTiers[stats.trustTier]}
        </Badge>
        <span className="flex items-center gap-1 text-sm font-medium">
          <Star className="h-4 w-4 fill-current text-amber-500" />
          {interpolate(t.reputation.ratingOutOf, { rating: stats.averageRating.toFixed(1) })}
        </span>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-xs text-muted-foreground">
          {interpolate(t.reputation.onTimeRate, { pct: Math.round(stats.punctualityScore) })}
        </span>
        <Progress value={stats.punctualityScore} />
      </div>
      <span className="text-xs text-muted-foreground">
        {interpolate(t.reputation.clubsCompleted, { n: stats.completedClubsCount })}
      </span>
    </div>
  );
}
