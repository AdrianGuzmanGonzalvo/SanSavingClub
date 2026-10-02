import { AgreementView, agreementMetadata } from "@/app/(content)/_views/agreement";

export const metadata = agreementMetadata("es");

export default function Page() {
  return <AgreementView locale="es" />;
}
