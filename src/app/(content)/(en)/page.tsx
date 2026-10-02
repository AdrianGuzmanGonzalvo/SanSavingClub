import { HomeView, homeMetadata } from "@/app/(content)/_views/home";

export const metadata = homeMetadata("en");

export default function Page() {
  return <HomeView locale="en" />;
}
