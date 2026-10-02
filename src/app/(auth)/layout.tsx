import type { Metadata } from "next";

// Sign-in, sign-up and password forms have no content worth indexing. They stay
// crawlable (see robots.ts) so search engines can actually read this noindex.
export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return children;
}
