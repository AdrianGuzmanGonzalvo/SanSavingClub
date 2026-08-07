import type { DurationUnit } from "@prisma/client";
import type { Dictionary } from "./dictionaries";

export function interpolate(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? ""));
}

export function formatClubDuration(t: Dictionary, unit: DurationUnit, count: number): string {
  return interpolate(unit === "WEEK" ? t.clubs.new.weeks : t.clubs.new.months, { n: count });
}

export function formatScheduleDay(t: Dictionary, unit: DurationUnit, day: number): string {
  return unit === "WEEK" ? t.common.weekdays[day] : interpolate(t.clubs.detail.dayOfMonth, { n: day });
}
