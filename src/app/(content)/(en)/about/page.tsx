import { AboutView, aboutMetadata } from "@/app/(content)/_views/pages";

export const metadata = aboutMetadata("en");

export default function Page() {
  return <AboutView locale="en" />;
}
