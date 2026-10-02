import type { Metadata } from "next";

// page.tsx is a Client Component and can't export metadata itself.
export const metadata: Metadata = {
  title: "Create your account",
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
