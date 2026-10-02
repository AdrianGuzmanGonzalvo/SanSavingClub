import { ContactView, contactMetadata } from "@/app/(content)/_views/pages";

export const metadata = contactMetadata("es");

export default function Page() {
  return <ContactView locale="es" />;
}
