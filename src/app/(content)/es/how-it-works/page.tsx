import { HowItWorksView, howItWorksMetadata } from "@/app/(content)/_views/how-it-works";

export const metadata = howItWorksMetadata("es");

export default function Page() {
  return <HowItWorksView locale="es" />;
}
