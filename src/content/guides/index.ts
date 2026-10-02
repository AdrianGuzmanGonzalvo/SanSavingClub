import type { Guide } from "../types";
import { clubRules } from "./club-rules";
import { howToOrganizeASan } from "./how-to-organize-a-san";
import { joiningASan } from "./joining-a-san";
import { lateOrMissedPayments } from "./late-or-missed-payments";
import { risksAndSafety } from "./risks-and-safety";
import { turnOrder } from "./turn-order";
import { whatIsASan } from "./what-is-a-san";

// In reading order. To add a guide, create its file here and append it — the
// index page, the sitemap and the "more guides" links all read from this list.
export const guides: Guide[] = [
  whatIsASan,
  joiningASan,
  howToOrganizeASan,
  turnOrder,
  clubRules,
  lateOrMissedPayments,
  risksAndSafety,
];

export function getGuide(slug: string): Guide | undefined {
  return guides.find((guide) => guide.slug === slug);
}
