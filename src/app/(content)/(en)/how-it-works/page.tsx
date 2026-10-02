import { HowItWorksView, howItWorksMetadata } from "@/app/(content)/_views/how-it-works";

export const metadata = howItWorksMetadata("en");

export default function Page() {
  return <HowItWorksView locale="en" />;
}
