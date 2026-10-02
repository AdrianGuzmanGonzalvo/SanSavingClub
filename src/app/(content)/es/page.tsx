import { HomeView, homeMetadata } from "@/app/(content)/_views/home";

export const metadata = homeMetadata("es");

export default function Page() {
  return <HomeView locale="es" />;
}
