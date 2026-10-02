import { ContentShell } from "@/app/(content)/_components/content-shell";

// Contact and legal pages: same header and footer as the content pages, but no
// AdSense script — see (content)/layout.tsx.
export default function Layout({ children }: { children: React.ReactNode }) {
  return <ContentShell locale="en">{children}</ContentShell>;
}
