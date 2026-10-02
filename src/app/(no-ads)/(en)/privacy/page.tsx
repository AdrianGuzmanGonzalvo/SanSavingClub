import { PrivacyView, privacyMetadata } from "@/app/(content)/_views/privacy";

export const metadata = privacyMetadata("en");

export default function Page() {
  return <PrivacyView locale="en" />;
}
