import type { Metadata } from "next";
import { GuideView, guideMetadata } from "@/app/(content)/_views/guides";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return guideMetadata("es", (await params).slug);
}

export default async function Page({ params }: Props) {
  return <GuideView locale="es" slug={(await params).slug} />;
}
