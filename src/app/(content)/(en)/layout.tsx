import { ContentShell } from "@/app/(content)/_components/content-shell";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <ContentShell locale="en">{children}</ContentShell>;
}
