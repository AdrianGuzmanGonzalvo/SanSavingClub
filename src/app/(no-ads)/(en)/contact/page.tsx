import { ContactView, contactMetadata } from "@/app/(content)/_views/pages";

export const metadata = contactMetadata("en");

export default function Page() {
  return <ContactView locale="en" />;
}
