import { GuidesIndexView, guidesIndexMetadata } from "@/app/(content)/_views/guides";

export const metadata = guidesIndexMetadata("en");

export default function Page() {
  return <GuidesIndexView locale="en" />;
}
