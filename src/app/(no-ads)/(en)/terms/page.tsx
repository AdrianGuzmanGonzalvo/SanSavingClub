import { TermsView, termsMetadata } from "@/app/(content)/_views/pages";

export const metadata = termsMetadata("en");

export default function Page() {
  return <TermsView locale="en" />;
}
