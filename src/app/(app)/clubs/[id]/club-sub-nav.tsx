"use client";

import { RegisterClubNav } from "@/lib/club-nav-context";

// Registers this club with the bottom nav (see club-nav-context.tsx) so it
// swaps to this club's tabs — Overview/Calendar/Report Payment/Admin —
// instead of the app-wide Dashboard/Reports/Profile tabs. Renders nothing
// itself; the tabs render in bottom-nav.tsx.
export function ClubSubNav({
  clubId,
  isAdmin,
  isParticipant = true,
}: {
  clubId: string;
  isAdmin: boolean;
  isParticipant?: boolean;
}) {
  return <RegisterClubNav clubId={clubId} isAdmin={isAdmin} isParticipant={isParticipant} />;
}
