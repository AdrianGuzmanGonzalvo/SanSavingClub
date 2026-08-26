"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type ClubNavState = { clubId: string; isAdmin: boolean; isParticipant: boolean } | null;

interface ClubNavContextValue {
  club: ClubNavState;
  setClub: (club: ClubNavState) => void;
}

const ClubNavContext = createContext<ClubNavContextValue | null>(null);

// Lets a club page (rendered deep under the app shell) tell the bottom nav
// — a sibling of that page's content, not an ancestor — which club it's in,
// so the bar can swap to that club's tabs instead of the global ones.
export function ClubNavProvider({ children }: { children: ReactNode }) {
  const [club, setClub] = useState<ClubNavState>(null);
  return <ClubNavContext.Provider value={{ club, setClub }}>{children}</ClubNavContext.Provider>;
}

export function useClubNav(): ClubNavContextValue {
  const ctx = useContext(ClubNavContext);
  if (!ctx) throw new Error("useClubNav must be used within ClubNavProvider");
  return ctx;
}

// Registers (and un-registers on unmount) the active club for the bottom
// nav to pick up. Renders nothing — used in place of the old visible
// in-page ClubSubNav strip.
export function RegisterClubNav({
  clubId,
  isAdmin,
  isParticipant = true,
}: {
  clubId: string;
  isAdmin: boolean;
  isParticipant?: boolean;
}) {
  const { setClub } = useClubNav();

  useEffect(() => {
    setClub({ clubId, isAdmin, isParticipant });
    return () => setClub(null);
  }, [clubId, isAdmin, isParticipant, setClub]);

  return null;
}
