import { PrivacyView, privacyMetadata } from "@/app/(content)/_views/privacy";

export const metadata = privacyMetadata("es");

export default function Page() {
  return <PrivacyView locale="es" />;
}
