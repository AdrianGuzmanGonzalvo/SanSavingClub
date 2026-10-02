import { AgreementView, agreementMetadata } from "@/app/(content)/_views/agreement";

export const metadata = agreementMetadata("en");

export default function Page() {
  return <AgreementView locale="en" />;
}
