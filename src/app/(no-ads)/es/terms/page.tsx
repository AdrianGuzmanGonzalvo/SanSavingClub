import { TermsView, termsMetadata } from "@/app/(content)/_views/pages";

export const metadata = termsMetadata("es");

export default function Page() {
  return <TermsView locale="es" />;
}
