import { GuidesIndexView, guidesIndexMetadata } from "@/app/(content)/_views/guides";

export const metadata = guidesIndexMetadata("es");

export default function Page() {
  return <GuidesIndexView locale="es" />;
}
