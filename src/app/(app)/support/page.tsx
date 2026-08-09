import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getDictionary, getLocale } from "@/lib/i18n/locale";
import { SupportForm } from "./support-form";

export default async function SupportPage() {
  const t = getDictionary(await getLocale());
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">{t.support.title}</h1>
        <p className="text-muted-foreground">{t.support.subtitle}</p>
      </div>

      <SupportForm userName={session.user.name ?? ""} userEmail={session.user.email ?? ""} />
    </div>
  );
}
