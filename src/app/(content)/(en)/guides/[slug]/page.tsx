import type { Metadata } from "next";
import { GuideView, guideMetadata } from "@/app/(content)/_views/guides";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return guideMetadata("en", (await params).slug);
}

export default async function Page({ params }: Props) {
  return <GuideView locale="en" slug={(await params).slug} />;
}
