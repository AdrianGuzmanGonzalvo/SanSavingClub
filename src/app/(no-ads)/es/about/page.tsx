import { AboutView, aboutMetadata } from "@/app/(content)/_views/pages";

export const metadata = aboutMetadata("es");

export default function Page() {
  return <AboutView locale="es" />;
}
